package com.alice.cosplaysuggestion.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.cosplaysuggestion.model.Account;
import com.alice.cosplaysuggestion.model.Festival;
import com.alice.cosplaysuggestion.model.NotificationFes;
import com.alice.cosplaysuggestion.repository.AccountRepository;
import com.alice.cosplaysuggestion.repository.NotificationFesRepository;

@Service
public class NotificationFesService {

    private static final Logger log = LoggerFactory.getLogger(NotificationFesService.class);

    private final NotificationFesRepository notificationFesRepository;
    private final AccountRepository accountRepository;

    public NotificationFesService(NotificationFesRepository notificationFesRepository, AccountRepository accountRepository) {
        this.notificationFesRepository = notificationFesRepository;
        this.accountRepository = accountRepository;
    }

    // Get notifications for a user
    public List<NotificationFes> getUserNotifications(Long userId) {
        return notificationFesRepository.findByUserId(userId);
    }

    // Get notifications for a festival
    public List<NotificationFes> getFestivalNotifications(Long festivalId) {
        return notificationFesRepository.findByFestivalIdAndIsActiveTrue(festivalId);
    }

    // Check if user has notification for a festival
    public Optional<NotificationFes> getUserFestivalNotification(Long userId, Long festivalId) {
        return notificationFesRepository.findByUserIdAndFestivalId(userId, festivalId);
    }

    // Create notification
    @Transactional
    public NotificationFes createNotification(Long userId, Festival festival, String note) {
        // Check if notification already exists
        Optional<NotificationFes> existing = notificationFesRepository.findByUserIdAndFestivalId(userId, festival.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("Notification already exists for this user and festival");
        }

        // Get user from repository (you'll need to inject AccountRepository)
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        NotificationFes notification = new NotificationFes(user, festival, note);
        log.info("Created notification for user {} and festival {}", user.getId(), festival.getName());
        return notificationFesRepository.save(notification);
    }

    // Update notification
    @Transactional
    public NotificationFes updateNotification(Long notificationId, String note, Boolean isActive) {
        NotificationFes notification = notificationFesRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setNote(note);
        if (isActive != null) {
            notification.setIsActive(isActive);
        }

        log.info("Updated notification for user {} and festival {}",
                notification.getUser().getId(), notification.getFestival().getName());
        return notificationFesRepository.save(notification);
    }

    // Delete notification
    @Transactional
    public void deleteNotification(Long notificationId) {
        NotificationFes notification = notificationFesRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        log.info("Deleted notification for user {} and festival {}",
                notification.getUser().getId(), notification.getFestival().getName());
        notificationFesRepository.delete(notification);
    }

    // Toggle notification status
    @Transactional
    public NotificationFes toggleNotificationStatus(Long notificationId) {
        NotificationFes notification = notificationFesRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setIsActive(!notification.getIsActive());
        log.info("Toggled notification status for user {} and festival {} - Active: {}",
                notification.getUser().getId(), notification.getFestival().getName(), notification.getIsActive());
        return notificationFesRepository.save(notification);
    }

    // Get active notifications with upcoming festivals
    public List<NotificationFes> getActiveNotificationsWithUpcomingFestivals(Long userId) {
        return notificationFesRepository.findActiveNotificationsWithUpcomingFestivals(userId, LocalDateTime.now());
    }

    // Get notifications for festivals in date range
    public List<NotificationFes> getNotificationsForFestivalsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return notificationFesRepository.findNotificationsForFestivalsInDateRange(startDate, endDate);
    }

    // Get notifications for festival reminders (only for verified users)
    public List<NotificationFes> getNotificationsForFestivalReminders(LocalDateTime startDate, LocalDateTime endDate) {
        return notificationFesRepository.findNotificationsForFestivalReminders(startDate, endDate);
    }
}
