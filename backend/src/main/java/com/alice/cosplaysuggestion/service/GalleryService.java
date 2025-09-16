package com.alice.cosplaysuggestion.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alice.cosplaysuggestion.model.GalleryFolder;
import com.alice.cosplaysuggestion.model.GalleryItem;
import com.alice.cosplaysuggestion.model.GalleryItem.ItemType;
import com.alice.cosplaysuggestion.repository.GalleryFolderRepository;
import com.alice.cosplaysuggestion.repository.GalleryItemRepository;

import jakarta.annotation.PostConstruct;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class GalleryService {

    private static final Logger log = LoggerFactory.getLogger(GalleryService.class);

    private final GalleryFolderRepository folderRepo;
    private final GalleryItemRepository itemRepo;

    // Constructor for dependency injection
    public GalleryService(GalleryFolderRepository folderRepo, GalleryItemRepository itemRepo) {
        this.folderRepo = folderRepo;
        this.itemRepo = itemRepo;
    }

    // Storage configuration
    @Value("${app.storage.type:local}")
    private String storageType;

    @Value("${app.gallery.storage.location:uploads/gallery}")
    private String galleryStorageLocation;

    @Value("${app.gallery.url.base:/api/gallery}")
    private String galleryUrlBase;

    // AWS S3 Configuration
    @Value("${aws.s3.bucket.name:}")
    private String s3BucketName;

    @Value("${aws.s3.region:ap-southeast-2}")
    private String s3Region;

    // Local storage
    private Path galleryRoot;

    // S3 storage
    private S3Client s3Client;
    private boolean isS3Storage;

    @PostConstruct
    public void init() {
        this.isS3Storage = "s3".equalsIgnoreCase(storageType);

        if (isS3Storage) {
            log.info("Using S3 file storage for gallery operations");
            initializeS3Client();
        } else {
            log.info("Using local file storage for gallery operations");
            initializeLocalPaths();
        }
    }

    private void initializeS3Client() {
        try {
            this.s3Client = S3Client.builder()
                    .region(Region.of(s3Region))
                    .build();
            log.info("S3 client initialized for gallery - Bucket: {} and Region: {}", s3BucketName, s3Region);
        } catch (software.amazon.awssdk.core.exception.SdkException e) {
            log.error("Failed to initialize S3 client for gallery: {}", e.getMessage());
            throw new RuntimeException("Could not initialize S3 client for gallery", e);
        }
    }

    private void initializeLocalPaths() {
        this.galleryRoot = Paths.get(galleryStorageLocation).toAbsolutePath().normalize();

        try {
            Files.createDirectories(galleryRoot);
            log.info("Local gallery storage directories created successfully");
        } catch (IOException e) {
            log.error("Could not create local gallery storage directories: {}", e.getMessage());
            throw new RuntimeException("Could not create gallery storage directories", e);
        }
    }

    // Trả về tất cả folder (không lọc isActive)
    public List<GalleryFolder> listAllFolders() {
        return folderRepo.findAll();
    }

    // Trả về chỉ folder active
    public List<GalleryFolder> listActiveFolders() {
        return folderRepo.findByIsActiveTrue();
    }

    // Trả về tất cả item trong folder (không lọc isActive)
    public List<GalleryItem> listAllItems(Long folderId) {
        GalleryFolder f = folderRepo.findById(folderId).orElseThrow();
        return itemRepo.findByFolder(f);
    }

    @Transactional
    public GalleryFolder uploadZip(MultipartFile zip, String displayName, MultipartFile thumbnail) throws IOException {
        if (zip == null || zip.isEmpty()) throw new IOException("Zip trống");
        String base = sanitize(stripExt(Optional.ofNullable(zip.getOriginalFilename()).orElse("gallery")));
        String storage = uniqueStorageName(base);

        GalleryFolder folder = new GalleryFolder(displayName != null && !displayName.isBlank() ? displayName : base, storage);
        folder = folderRepo.save(folder);

        // unzip files
        try (ZipInputStream zis = new ZipInputStream(zip.getInputStream())) {
            ZipEntry e;
            while ((e = zis.getNextEntry()) != null) {
                if (e.isDirectory()) continue;
                String raw = e.getName().replace('\\', '/');
                if (raw.startsWith("__MACOSX") || raw.endsWith("/.DS_Store")) { zis.closeEntry(); continue; }
                String name = raw.substring(raw.lastIndexOf('/') + 1);
                if (name.startsWith("._")) { zis.closeEntry(); continue; }
                String safe = sanitizeFilename(name);

                String lower = raw.toLowerCase(Locale.ROOT);
                String sub = lower.contains("/video/") || lower.startsWith("video/") ? "video" : lower.contains("/thumb/") || lower.startsWith("thumb/") ? "thumb" : "pic";

                // Store file based on storage type
                storeGalleryFile(zis, storage, sub, safe, e.getSize());

                if ("thumb".equals(sub)) {
                    if (folder.getThumbnailUrl() == null || folder.getThumbnailUrl().isBlank()) {
                        folder.setThumbnailUrl(buildGalleryUrl(storage, "thumb", safe));
                    }
                } else {
                    ItemType type = "video".equals(sub) ? ItemType.VIDEO : ItemType.IMAGE;
                    itemRepo.save(new GalleryItem(folder, safe, sub, type, buildGalleryUrl(storage, sub, safe)));
                }
                zis.closeEntry();
            }
        }

        // optional thumbnail
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String safeThumb = ensureImageExt(sanitizeFilename(Optional.ofNullable(thumbnail.getOriginalFilename()).orElse("thumb")));
            storeGalleryFile(thumbnail.getInputStream(), storage, "thumb", safeThumb, thumbnail.getSize());
            folder.setThumbnailUrl(buildGalleryUrl(storage, "thumb", safeThumb));
        }

        return folderRepo.save(folder);
    }

    // Store gallery file to appropriate storage (S3 or local)
    private void storeGalleryFile(InputStream inputStream, String storage, String subDir, String fileName, long contentLength) throws IOException {
        if (isS3Storage) {
            storeGalleryFileToS3(inputStream, storage, subDir, fileName, contentLength);
        } else {
            storeGalleryFileLocally(inputStream, storage, subDir, fileName);
        }
    }

    // Store gallery file to S3
    private void storeGalleryFileToS3(InputStream inputStream, String storage, String subDir, String fileName, long contentLength) throws IOException {
        try {
            String s3Key = "gallery/" + storage + "/" + subDir + "/" + fileName;

            PutObjectRequest.Builder builder = PutObjectRequest.builder()
                    .bucket(s3BucketName)
                    .key(s3Key)
                    .contentType(getContentType(fileName));

            if (contentLength > 0) {
                builder.contentLength(contentLength);
            }

            PutObjectRequest putObjectRequest = builder.build();

            RequestBody requestBody;
            Path tempFile = null;
            if (contentLength > 0) {
                requestBody = RequestBody.fromInputStream(inputStream, contentLength);
            } else {
                // Use temp file if size unknown to avoid OutOfMemory
                Path tempDir = Paths.get(System.getProperty("java.io.tmpdir", "/tmp"));
                tempFile = Files.createTempFile(tempDir, "upload", ".tmp");
                Files.copy(inputStream, tempFile, StandardCopyOption.REPLACE_EXISTING);
                long actualContentLength = Files.size(tempFile);
                builder.contentLength(actualContentLength);
                putObjectRequest = builder.build();
                requestBody = RequestBody.fromFile(tempFile);
            }

            s3Client.putObject(putObjectRequest, requestBody);

            // Delete temp file after upload
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    log.warn("Failed to delete temp file: {}", tempFile, e);
                }
            }

            log.debug("Gallery file uploaded to S3: {}", s3Key);

        } catch (software.amazon.awssdk.services.s3.model.S3Exception e) {
            log.error("S3 error uploading gallery file: {}", e.getMessage());
            throw new IOException("Failed to upload file to S3", e);
        } catch (software.amazon.awssdk.core.exception.SdkException e) {
            log.error("AWS SDK error uploading gallery file: {}", e.getMessage());
            throw new IOException("Failed to upload file to S3", e);
        }
    }

    // Store gallery file locally
    private void storeGalleryFileLocally(InputStream inputStream, String storage, String subDir, String fileName) throws IOException {
        Path targetDir = galleryRoot.resolve(storage).resolve(subDir);
        Files.createDirectories(targetDir);
        Path target = targetDir.resolve(fileName);
        Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Gallery file stored locally: {}", fileName);
    }

    // Build gallery file URL based on storage type
    private String buildGalleryUrl(String storage, String subDir, String fileName) {
        if (isS3Storage) {
            // S3 storage: get full S3 URL
            return getS3GalleryFileUrl(storage, subDir, fileName);
        } else {
            // Local storage: use pattern
            String base = galleryUrlBase;
            if (!base.endsWith("/")) {
                base += "/";
            }
            return base + storage + "/" + subDir + "/" + fileName;
        }
    }

    // Get S3 gallery file URL
    private String getS3GalleryFileUrl(String storage, String subDir, String fileName) {
        try {
            String key = "gallery/" + storage + "/" + subDir + "/" + fileName;
            GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                    .bucket(s3BucketName)
                    .key(key)
                    .build();
            return s3Client.utilities().getUrl(getUrlRequest).toString();
        } catch (software.amazon.awssdk.core.exception.SdkException e) {
            log.error("Failed to get S3 URL for gallery file: {}", fileName);
            return "";
        }
    }

    // Get content type based on file extension
    private String getContentType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".gif")) {
            return "image/gif";
        } else if (lower.endsWith(".webp")) {
            return "image/webp";
        } else if (lower.endsWith(".mp4")) {
            return "video/mp4";
        } else if (lower.endsWith(".avi")) {
            return "video/x-msvideo";
        } else {
            return "application/octet-stream";
        }
    }

    @Transactional
    public void deleteFolder(Long folderId) throws IOException {
        GalleryFolder f = folderRepo.findById(folderId).orElseThrow();
        // Xóa hết các gallery item thuộc folder trước khi xóa folder
        itemRepo.deleteAll(itemRepo.findByFolder(f));

        if (isS3Storage) {
            deleteGalleryFolderFromS3(f.getStorageName());
        } else {
            deleteGalleryFolderLocally(f.getStorageName());
        }

        folderRepo.delete(f);
    }

    // Delete gallery folder from S3
    private void deleteGalleryFolderFromS3(String storageName) {
        // Note: S3 doesn't have folders, but we can delete all objects with the prefix
        // For simplicity, we'll just log that files should be cleaned up manually
        // In production, you might want to implement batch deletion
        log.info("Gallery folder {} files should be cleaned up from S3", storageName);
    }

    // Delete gallery folder locally
    private void deleteGalleryFolderLocally(String storageName) throws IOException {
        Path folderPath = galleryRoot.resolve(storageName);
        if (Files.exists(folderPath)) {
            Files.walk(folderPath)
                .sorted((a,b) -> b.compareTo(a))
                .forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
        }
    }

    @Transactional
    public GalleryFolder setFolderActive(Long folderId, boolean active) {
        GalleryFolder f = folderRepo.findById(folderId).orElseThrow();
        f.setIsActive(active);
        return folderRepo.save(f);
    }

    // Đổi trạng thái active/inactive cho item
    @Transactional
    public GalleryItem setItemActive(Long itemId, boolean active) {
        GalleryItem item = itemRepo.findById(itemId).orElseThrow();
        item.setIsActive(active);
        return itemRepo.save(item);
    }

        // Delete item
    @Transactional
    public void deleteItem(Long itemId) throws IOException {
        GalleryItem item = itemRepo.findById(itemId).orElseThrow();
        GalleryFolder folder = item.getFolder();

        // Delete file based on storage type
        deleteGalleryFile(folder.getStorageName(), item.getSubDir(), item.getFileName());

        itemRepo.delete(item);
    }

    // Upload item vào folder
    @Transactional
    public GalleryItem uploadItem(Long folderId, MultipartFile file, String type) throws IOException {
        GalleryFolder folder = folderRepo.findById(folderId).orElseThrow();
        String safe = sanitizeFilename(Optional.ofNullable(file.getOriginalFilename()).orElse("item"));
        String sub = "VIDEO".equalsIgnoreCase(type) ? "video" : "pic";
        ItemType itemType = "VIDEO".equalsIgnoreCase(type) ? ItemType.VIDEO : ItemType.IMAGE;

        // Store file based on storage type
        storeGalleryFile(file.getInputStream(), folder.getStorageName(), sub, safe, file.getSize());

        GalleryItem item = new GalleryItem(folder, safe, sub, itemType, buildGalleryUrl(folder.getStorageName(), sub, safe));
        return itemRepo.save(item);
    }

    // Delete gallery file (S3 or local)
    private void deleteGalleryFile(String storageName, String subDir, String fileName) throws IOException {
        if (isS3Storage) {
            String key = "gallery/" + storageName + "/" + subDir + "/" + fileName;
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(s3BucketName)
                    .key(key)
                    .build());
        } else {
            Path target = galleryRoot.resolve(storageName).resolve(subDir).resolve(fileName);
            Files.deleteIfExists(target);
        }
    }

    // Download folder as ZIP
    public Path downloadZip(Long folderId) throws IOException {
        GalleryFolder folder = folderRepo.findById(folderId).orElseThrow(() -> new IOException("Folder not found"));
        List<GalleryItem> items = itemRepo.findByFolder(folder);

        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir", "/tmp"));
        Path zipFile = Files.createTempFile(tempDir, "download", ".zip");

        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipFile))) {
            for (GalleryItem item : items) {
                String key = "gallery/" + folder.getStorageName() + "/" + item.getSubDir() + "/" + item.getFileName();
                try {
                    GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                            .bucket(s3BucketName)
                            .key(key)
                            .build();
                    ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);
                    ZipEntry zipEntry = new ZipEntry(item.getSubDir() + "/" + item.getFileName());
                    zos.putNextEntry(zipEntry);
                    s3Object.transferTo(zos);
                    zos.closeEntry();
                } catch (Exception e) {
                    log.error("Failed to add file to zip: {}", key, e);
                }
            }
        }

        return zipFile;
    }

    // Search folders by name (case-insensitive) - only active folders
    public List<GalleryFolder> searchFoldersByName(String query) {
        if (query == null || query.trim().isEmpty()) {
            return folderRepo.findByIsActiveTrue();
        }
        return folderRepo.findByDisplayNameContainingIgnoreCaseAndIsActiveTrue(query.trim());
    }

    private String stripExt(String n) { int i = n.lastIndexOf('.'); return i==-1?n:n.substring(0,i); }
    private String sanitize(String n) {
        String s = Normalizer.normalize(n, Normalizer.Form.NFD)
                .replaceAll("[^\\u0000-\\u007F]", "")
                .replaceAll("[^a-zA-Z0-9-_]", "-")
                .replaceAll("-+", "-")
                .replaceAll("(^-+|-+$)", "");
        return s.isBlank()? UUID.randomUUID().toString().substring(0,8) : s.toLowerCase(Locale.ROOT);
    }
    private String sanitizeFilename(String n) {
        return n.replaceAll("[\\\\/]+", "_")
                .replaceAll("[:*?\"<>|]", "_")
                .trim();
    }
    private String ensureImageExt(String n) { return n.toLowerCase(Locale.ROOT).matches(".*\\.(jpg|jpeg|png|gif|webp)$") ? n : n+".jpg"; }
    private String uniqueStorageName(String base) {
        String c = base; int i=1; while (folderRepo.existsByStorageName(c)) c = base + "-" + (++i); return c;
    }
}

