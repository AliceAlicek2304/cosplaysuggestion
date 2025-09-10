package com.alice.cosplaysuggestion.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * Universal file storage service supporting both local and S3 storage
 * Storage type is determined by app.storage.type property:
 * - "local": stores files locally (development)
 * - "s3": stores files in AWS S3 (production)
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.avatar.storage.location}")
    private String avatarStorageLocation;

    @Value("${app.avatar.url.pattern}")
    private String avatarUrlPattern;

    @Value("${app.storage.type:local}")
    private String storageType;

    // AWS S3 Configuration
    @Value("${aws.s3.bucket.name:}")
    private String s3BucketName;

    @Value("${aws.s3.region:ap-southeast-2}")
    private String s3Region;

    // Local storage
    private Path avatarStoragePath;
    
    // S3 storage
    private S3Client s3Client;
    private boolean isS3Storage;

    @PostConstruct
    public void init() {
        this.isS3Storage = "s3".equalsIgnoreCase(storageType);
        
        if (isS3Storage) {
            log.info("Using S3 file storage for file operations");
            initializeS3Client();
        } else {
            log.info("Using local file storage for file operations");
            initializeLocalPaths();
        }
    }

    private void initializeS3Client() {
        try {
            this.s3Client = S3Client.builder()
                    .region(Region.of(s3Region))
                    .build();
            log.info("S3 client initialized for region: {} and bucket: {}", s3Region, s3BucketName);
        } catch (Exception e) {
            log.error("Failed to initialize S3 client: {}", e.getMessage());
            throw new RuntimeException("Could not initialize S3 client", e);
        }
    }

    private void initializeLocalPaths() {
        this.avatarStoragePath = Paths.get(avatarStorageLocation).toAbsolutePath().normalize();

        try {
            Files.createDirectories(avatarStoragePath);
            copyDefaultAvatar();
            log.info("Local storage directories created successfully");
        } catch (IOException e) {
            log.error("Could not create local storage directories: {}", e.getMessage());
            throw new RuntimeException("Could not create storage directories", e);
        }
    }

    private void copyDefaultAvatar() throws IOException {
        Path defaultAvatarPath = avatarStoragePath.resolve("default-avatar.jpg");

        if (!Files.exists(defaultAvatarPath)) {
            try {
                // Try to copy from uploads folder first
                Path uploadsDefaultAvatar = Paths.get("uploads/avatar/default-avatar.jpg");
                if (Files.exists(uploadsDefaultAvatar)) {
                    Files.copy(uploadsDefaultAvatar, defaultAvatarPath, StandardCopyOption.REPLACE_EXISTING);
                    log.info("Default avatar copied from uploads folder");
                } else {
                    // Try to copy from resources
                    try (InputStream inputStream = new ClassPathResource("static/img/default-avatar.jpg").getInputStream()) {
                        Files.copy(inputStream, defaultAvatarPath, StandardCopyOption.REPLACE_EXISTING);
                        log.info("Default avatar copied from resources");
                    } catch (IOException e) {
                        // Create empty file as fallback
                        Files.createFile(defaultAvatarPath);
                        log.warn("Created empty default avatar file as fallback: {}", e.getMessage());
                    }
                }
            } catch (IOException e) {
                log.error("Failed to create default avatar: {}", e.getMessage());
                // Create empty file as fallback
                Files.createFile(defaultAvatarPath);
            }
        }
    }

    /**
     * Helper to build avatar URL based on storage type
     */
    private String buildAvatarUrl(String fileName) {
        if (isS3Storage) {
            // S3 storage: get full S3 URL
            return getS3FileUrl("avatars/" + fileName);
        } else {
            // Local storage: use pattern
            String base = avatarUrlPattern;
            if (!base.endsWith("/")) {
                base += "/";
            }
            if (fileName.startsWith("/")) {
                fileName = fileName.substring(1);
            }
            return base + fileName;
        }
    }

    /**
     * Get S3 file URL
     */
    private String getS3FileUrl(String key) {
        try {
            GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                    .bucket(s3BucketName)
                    .key(key)
                    .build();
            return s3Client.utilities().getUrl(getUrlRequest).toString();
        } catch (Exception e) {
            log.error("Failed to get S3 URL for key: {}", key);
            return "";
        }
    }

    /**
     * Get default avatar URL
     */
    public String getDefaultAvatarUrl() {
        return buildAvatarUrl("default-avatar.jpg");
    }

    /**
     * Store avatar file for a user
     */
    public String storeAvatar(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return getDefaultAvatarUrl();
        }
        
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFileName = UUID.randomUUID().toString().substring(0, 8) + "_" + timestamp + fileExtension;
        
        if (isS3Storage) {
            return storeAvatarToS3(file, uniqueFileName);
        } else {
            return storeAvatarLocally(file, uniqueFileName);
        }
    }

    /**
     * Store avatar file for a specific user ID
     */
    public String saveAvatarFile(MultipartFile file, Long userId) throws IOException {
        if (file == null || file.isEmpty()) {
            return getDefaultAvatarUrl();
        }
        
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFileName = "user_" + userId + "_" + timestamp + fileExtension;
        
        if (isS3Storage) {
            return storeAvatarToS3(file, uniqueFileName);
        } else {
            return storeAvatarLocally(file, uniqueFileName);
        }
    }

    /**
     * Store avatar to S3
     */
    private String storeAvatarToS3(MultipartFile file, String fileName) throws IOException {
        try {
            String s3Key = "avatars/" + fileName;
            
            long size = file.getSize();
            PutObjectRequest putObjectRequest;
            RequestBody requestBody;
            Path tempFile = null;
            if (size > 0) {
                putObjectRequest = PutObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(s3Key)
                        .contentType(file.getContentType())
                        .contentLength(size)
                        .build();
                requestBody = RequestBody.fromInputStream(file.getInputStream(), size);
            } else {
                // Use temp file if size unknown
                Path tempDir = Paths.get(System.getProperty("java.io.tmpdir", "/tmp"));
                tempFile = Files.createTempFile(tempDir, "avatar", ".tmp");
                Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
                long actualSize = Files.size(tempFile);
                putObjectRequest = PutObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(s3Key)
                        .contentType(file.getContentType())
                        .contentLength(actualSize)
                        .build();
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
            
            String fileUrl = getS3FileUrl(s3Key);
            log.debug("Avatar uploaded to S3: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("Failed to upload avatar to S3: {}", e.getMessage());
            throw new IOException("Failed to upload file to S3", e);
        }
    }

    /**
     * Store avatar locally
     */
    private String storeAvatarLocally(MultipartFile file, String fileName) throws IOException {
        Path targetLocation = avatarStoragePath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Avatar stored locally: {}", fileName);
        return buildAvatarUrl(fileName);
    }

    /**
     * Delete file by file path
     */
    public void deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        // Extract filename
        String fileName = extractFileNameFromPath(filePath);
        if (fileName == null || fileName.equals("default-avatar.jpg")) {
            return; // Don't delete default files
        }

        if (isS3Storage) {
            deleteFileFromS3(filePath);
        } else {
            deleteFileLocally(filePath, fileName);
        }
    }

    /**
     * Delete file from S3
     */
    private void deleteFileFromS3(String fileUrl) {
        try {
            String key = extractS3KeyFromUrl(fileUrl);
            if (key != null && !key.contains("default-avatar")) {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(key)
                        .build();

                s3Client.deleteObject(deleteObjectRequest);
                log.debug("File deleted from S3: {}", key);
            }
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", e.getMessage());
        }
    }

    /**
     * Delete file locally
     */
    private void deleteFileLocally(String filePath, String fileName) throws IOException {
        if (filePath.contains(avatarUrlPattern)) {
            Path targetPath = avatarStoragePath.resolve(fileName);
            if (Files.exists(targetPath)) {
                Files.delete(targetPath);
                log.debug("File deleted locally: {}", fileName);
            }
        }
    }

    /**
     * Extract S3 key from full URL
     */
    private String extractS3KeyFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }

        try {
            // URL format: https://bucket.s3.region.amazonaws.com/key
            String[] parts = fileUrl.split(s3BucketName + ".s3");
            if (parts.length > 1) {
                String afterBucket = parts[1];
                int keyStart = afterBucket.indexOf("/");
                if (keyStart != -1) {
                    return afterBucket.substring(keyStart + 1);
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract key from URL: {}", fileUrl);
        }
        
        return null;
    }

    private String extractFileNameFromPath(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return null;
        }

        int lastSlashIndex = filePath.lastIndexOf('/');
        if (lastSlashIndex != -1 && lastSlashIndex < filePath.length() - 1) {
            return filePath.substring(lastSlashIndex + 1);
        }

        return null;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return "";
        }
        int lastIndexOf = fileName.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return fileName.substring(lastIndexOf);
    }

    // Helper method for health checks
    public String getStorageInfo() {
        if (isS3Storage) {
            return "S3 File Storage - Bucket: " + s3BucketName + ", Region: " + s3Region;
        } else {
            return "Local File Storage (Cosplay App optimized)";
        }
    }
}
