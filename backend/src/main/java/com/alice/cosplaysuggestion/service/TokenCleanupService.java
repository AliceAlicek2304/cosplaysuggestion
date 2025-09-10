package com.alice.cosplaysuggestion.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.cosplaysuggestion.repository.EmailVerificationTokenRepository;

@Service
public class TokenCleanupService {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupService.class);
    
    @Autowired
    private EmailVerificationTokenRepository tokenRepository;
    
    // Cleanup expired tokens every hour
    // Cron: 0 0 * * * * = every hour at minute 0
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        logger.info("Starting cleanup of expired verification tokens...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Count before deletion for logging
            long countBefore = tokenRepository.count();
            
            // Delete expired tokens
            tokenRepository.deleteAllExpiredTokens(now);
            
            long countAfter = tokenRepository.count();
            long deletedCount = countBefore - countAfter;
            
            if (deletedCount > 0) {
                logger.info("Cleaned up {} expired verification tokens", deletedCount);
            } else {
                logger.debug("No expired tokens to cleanup");
            }
            
        } catch (Exception e) {
            logger.error("Error during token cleanup", e);
        }
    }
    
    // Cleanup very old tokens (older than 7 days) every day at 2 AM
    // This is a safety net for any tokens that might have been missed
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupOldTokens() {
        logger.info("Starting cleanup of very old verification tokens...");
        
        try {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            
            // Custom query to delete tokens older than 7 days regardless of expiry
            long deletedCount = tokenRepository.deleteByCreatedAtBefore(sevenDaysAgo);
            
            if (deletedCount > 0) {
                logger.info("Cleaned up {} very old verification tokens (>7 days)", deletedCount);
            } else {
                logger.debug("No very old tokens to cleanup");
            }
            
        } catch (Exception e) {
            logger.error("Error during old token cleanup", e);
        }
    }
    
    // Manual cleanup method that can be called by admin
    @Transactional
    public long manualCleanup() {
        logger.info("Manual cleanup of expired tokens requested");
        
        LocalDateTime now = LocalDateTime.now();
        long countBefore = tokenRepository.count();
        
        tokenRepository.deleteAllExpiredTokens(now);
        
        long countAfter = tokenRepository.count();
        long deletedCount = countBefore - countAfter;
        
        logger.info("Manual cleanup completed. Deleted {} tokens", deletedCount);
        return deletedCount;
    }
    
    // Get statistics about tokens
    public TokenStats getTokenStats() {
        long totalTokens = tokenRepository.count();
        long expiredTokens = tokenRepository.countExpiredTokens(LocalDateTime.now());
        long activeTokens = totalTokens - expiredTokens;
        
        return new TokenStats(totalTokens, activeTokens, expiredTokens);
    }
    
    // Inner class for token statistics
    public static class TokenStats {
        private final long totalTokens;
        private final long activeTokens;
        private final long expiredTokens;
        
        public TokenStats(long totalTokens, long activeTokens, long expiredTokens) {
            this.totalTokens = totalTokens;
            this.activeTokens = activeTokens;
            this.expiredTokens = expiredTokens;
        }
        
        public long getTotalTokens() { return totalTokens; }
        public long getActiveTokens() { return activeTokens; }
        public long getExpiredTokens() { return expiredTokens; }
        
        @Override
        public String toString() {
            return String.format("TokenStats{total=%d, active=%d, expired=%d}", 
                               totalTokens, activeTokens, expiredTokens);
        }
    }
}
