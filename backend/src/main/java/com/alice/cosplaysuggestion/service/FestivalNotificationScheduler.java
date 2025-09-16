package com.alice.cosplaysuggestion.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.cosplaysuggestion.model.NotificationFes;

@Service
public class FestivalNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(FestivalNotificationScheduler.class);

    @Autowired
    private NotificationFesService notificationFesService;

    @Autowired
    private EmailService emailService;

    // Send festival reminders every day at 9 AM
    // Cron: 0 0 9 * * * = every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void sendFestivalReminders() {
        logger.info("Starting festival reminder job...");

        try {
            // Calculate date range: tomorrow to 2 days from now
            LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).toLocalDate().atStartOfDay();
            LocalDateTime dayAfterTomorrow = LocalDateTime.now().plusDays(2).toLocalDate().atTime(23, 59, 59);

            logger.info("Looking for festivals between {} and {}", tomorrow, dayAfterTomorrow);

            // Get all notifications for festivals in the next 2 days (only for verified users)
            List<NotificationFes> notifications = notificationFesService.getNotificationsForFestivalReminders(tomorrow, dayAfterTomorrow);

            logger.info("Found {} notifications to send reminders for", notifications.size());

            int sentCount = 0;
            for (NotificationFes notification : notifications) {
                try {
                    // Send reminder email
                    emailService.sendFestivalReminderEmail(
                        notification.getUser().getEmail(),
                        notification.getUser().getFullName(),
                        notification.getFestival().getName(),
                        notification.getFestival().getLocation(),
                        notification.getFestival().getStartDate(),
                        notification.getFestival().getLink()
                    );

                    sentCount++;
                    logger.debug("Sent reminder to {} for festival: {}",
                        notification.getUser().getEmail(),
                        notification.getFestival().getName());

                } catch (Exception e) {
                    logger.error("Failed to send reminder to {} for festival: {}",
                        notification.getUser().getEmail(),
                        notification.getFestival().getName(), e);
                }
            }

            logger.info("Festival reminder job completed. Sent {} reminders out of {} notifications", sentCount, notifications.size());

        } catch (Exception e) {
            logger.error("Error during festival reminder job", e);
        }
    }

    // Test method to manually trigger reminders (for testing purposes)
    @Transactional(readOnly = true)
    public void sendTestReminders() {
        logger.info("Manually triggering festival reminder job for testing...");
        sendFestivalReminders();
    }
}
