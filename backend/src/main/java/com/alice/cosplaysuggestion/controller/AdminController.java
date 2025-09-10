package com.alice.cosplaysuggestion.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.cosplaysuggestion.dto.ApiResponse;
import com.alice.cosplaysuggestion.service.TokenCleanupService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private TokenCleanupService tokenCleanupService;
    
    // Manual cleanup of expired tokens
    // POST /api/admin/cleanup-tokens
    @PostMapping("/cleanup-tokens")
    public ResponseEntity<?> manualTokenCleanup() {
        try {
            logger.info("Manual token cleanup requested by admin");
            
            long deletedCount = tokenCleanupService.manualCleanup();
            
            return ResponseEntity.ok(ApiResponse.success(
                "Token cleanup completed successfully",
                "Deleted " + deletedCount + " expired tokens"));
            
        } catch (Exception e) {
            logger.error("Error during manual token cleanup: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to cleanup tokens: " + e.getMessage()));
        }
    }
    
    // Get token statistics
    // GET /api/admin/token-stats
    @GetMapping("/token-stats")
    public ResponseEntity<?> getTokenStats() {
        try {
            TokenCleanupService.TokenStats stats = tokenCleanupService.getTokenStats();
            
            return ResponseEntity.ok(ApiResponse.success("Token statistics retrieved", stats));
            
        } catch (Exception e) {
            logger.error("Error getting token stats: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get token statistics: " + e.getMessage()));
        }
    }
    
    // Health check for admin endpoints
    // GET /api/admin/health
    @GetMapping("/health")
    public ResponseEntity<?> adminHealthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Admin service is healthy!"));
    }
}
