package com.alice.cosplaysuggestion.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alice.cosplaysuggestion.dto.ApiResponse;
import com.alice.cosplaysuggestion.dto.GalleryItemDto;
import com.alice.cosplaysuggestion.model.GalleryItem;
import com.alice.cosplaysuggestion.service.GalleryService;

@RestController
@RequestMapping("/api/gallery")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://main.d3gxp9k6k5djri.amplifyapp.com",
        "https://cosplaysg.ddns.net"
    },
    allowCredentials = "true",
    maxAge = 3600
)
public class GalleryController {
    // API tổng hợp: trả về danh sách tất cả folder gallery (không lọc isActive)
    @GetMapping("")
    public ResponseEntity<?> getAllGalleryFolders() {
        return ResponseEntity.ok(ApiResponse.success("Danh sách gallery", galleryService.listAllFolders()));
    }

    private final GalleryService galleryService;
    private final Path galleryRoot = Paths.get("uploads/gallery").toAbsolutePath().normalize();

    public GalleryController(GalleryService galleryService) throws IOException {
        this.galleryService = galleryService;
        Files.createDirectories(galleryRoot);
    }

    // Public list folders (không lọc isActive)
    @GetMapping("/folders")
    public ResponseEntity<?> listFolders() {
        return ResponseEntity.ok(ApiResponse.success("Danh sách thư mục", galleryService.listAllFolders()));
    }

    // Public list items of folder (trả về tất cả item)
    @GetMapping("/folders/{id}/items")
    public ResponseEntity<?> listItems(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Danh sách file", galleryService.listAllItems(id)));
    }

    // Admin: upload zip
    @PostMapping(value = "/folders/uploadZip", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadZip(@RequestParam("file") MultipartFile file, @RequestParam(value = "displayName", required = false) String displayName, @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        try {
            // Log file information for debugging
            System.out.println("Upload request received:");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            System.out.println("Display name: " + displayName);
            if (thumbnail != null) {
                System.out.println("Thumbnail size: " + thumbnail.getSize());
            }
            
            return ResponseEntity.ok(ApiResponse.success("Tải lên thành công", galleryService.uploadZip(file, displayName, thumbnail)));
        } catch (Exception e) {
            System.err.println("Upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload thất bại: " + e.getMessage()));
        }
    }

    // Admin: delete folder
    @DeleteMapping("/folders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFolder(@PathVariable Long id) {
        try {
            galleryService.deleteFolder(id);
            return ResponseEntity.ok(ApiResponse.success("Đã xoá thư mục"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Xoá thất bại: " + e.getMessage()));
        }
    }

    // Download folder as ZIP
    @GetMapping("/folders/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFolder(@PathVariable Long id) {
        try {
            Path zipFile = galleryService.downloadZip(id);
            Resource resource = new UrlResource(zipFile.toUri());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"folder_" + id + ".zip\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/zip")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Admin: active/inactive folder
    @PutMapping("/folders/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setActive(@PathVariable Long id, @RequestParam("active") boolean active) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái", galleryService.setFolderActive(id, active)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cập nhật thất bại: " + e.getMessage()));
        }
    }

    // Admin: đổi trạng thái active/inactive cho item
    @PutMapping("/items/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setItemActive(@PathVariable Long id, @RequestParam("active") boolean active) {
        try {
            GalleryItem item = galleryService.setItemActive(id, active);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái", new GalleryItemDto(item)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cập nhật thất bại: " + e.getMessage()));
        }
    }

    // Admin: xoá item
    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            galleryService.deleteItem(id);
            return ResponseEntity.ok(ApiResponse.success("Đã xoá item"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Xoá thất bại: " + e.getMessage()));
        }
    }

    // Admin: upload item vào folder
    @PostMapping(value = "/folders/{folderId}/items/upload", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadItem(@PathVariable Long folderId, @RequestParam("file") MultipartFile file, @RequestParam("type") String type) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Tải lên thành công", galleryService.uploadItem(folderId, file, type)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload thất bại: " + e.getMessage()));
        }
    }

    // Serve static file from uploads/gallery
    @GetMapping("/{storage}/{sub}/{name:.+}")
    public ResponseEntity<Resource> serve(@PathVariable String storage, @PathVariable String sub, @PathVariable String name) {
        try {
            if (!"pic".equals(sub) && !"video".equals(sub) && !"thumb".equals(sub)) return ResponseEntity.notFound().build();
            Path file = galleryRoot.resolve(storage).resolve(sub).resolve(name).normalize();
            if (!file.startsWith(galleryRoot)) return ResponseEntity.notFound().build();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) return ResponseEntity.notFound().build();

            String contentType = Files.probeContentType(file);
            if (contentType == null) contentType = "application/octet-stream";
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

