package com.alice.cosplaysuggestion.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/background")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BackgroundController {
    
    private static final Logger logger = LoggerFactory.getLogger(BackgroundController.class);
    private final Path backgroundStoragePath;
    
    public BackgroundController() {
        this.backgroundStoragePath = Paths.get("uploads/background").toAbsolutePath().normalize();
        logger.info("Background controller initialized with path: {}", backgroundStoragePath);
    }
    
    // Serve background files
    // GET /api/background/{filename}
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveBackgroundFile(@PathVariable String filename) {
        try {
            Path filePath = backgroundStoragePath.resolve(filename).normalize();
            
            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(backgroundStoragePath)) {
                logger.warn("Attempted to access file outside storage directory: {}", filename);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = null;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException ex) {
                    logger.debug("Could not determine file type for: {}", filename);
                }
                
                // Fallback to default content type if type could not be determined
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600") // Cache for 1 hour
                        .body(resource);
            } else {
                logger.warn("Background file not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            logger.error("Error serving background file: {}", filename, ex);
            return ResponseEntity.internalServerError().build();
        }
    }
}
