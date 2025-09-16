package com.alice.cosplaysuggestion.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alice.cosplaysuggestion.dto.ApiResponse;
import com.alice.cosplaysuggestion.model.Festival;
import com.alice.cosplaysuggestion.model.NotificationFes;
import com.alice.cosplaysuggestion.service.FestivalService;
import com.alice.cosplaysuggestion.service.NotificationFesService;
import com.alice.cosplaysuggestion.service.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/notifications/fes")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://main.d3gxp9k6k5djri.amplifyapp.com",
        "https://cosplaysg.ddns.net"
    },
    allowCredentials = "true",
    maxAge = 3600
)
public class NotificationFesController {

    private final NotificationFesService notificationFesService;
    private final FestivalService festivalService;

    public NotificationFesController(NotificationFesService notificationFesService, FestivalService festivalService) {
        this.notificationFesService = notificationFesService;
        this.festivalService = festivalService;
    }

    // Get current user's notifications
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        List<NotificationFes> notifications = notificationFesService.getUserNotifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Thông báo của bạn", notifications));
    }

    // Get current user's active notifications with upcoming festivals
    @GetMapping("/my/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyUpcomingNotifications(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        List<NotificationFes> notifications = notificationFesService.getActiveNotificationsWithUpcomingFestivals(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Thông báo lễ hội sắp tới", notifications));
    }

    // Create notification for a festival
    @PostMapping("/festival/{festivalId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createNotification(
            @PathVariable Long festivalId,
            @RequestBody(required = false) NotificationRequest request,
            Authentication authentication) {

        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        Festival festival = festivalService.getFestivalById(festivalId)
                .orElseThrow(() -> new RuntimeException("Festival not found"));

        if (!festival.getIsActive()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lễ hội này không còn hoạt động"));
        }

        try {
            String note = request != null ? request.getNote() : null;
            NotificationFes notification = notificationFesService.createNotification(userPrincipal.getId(), festival, note);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký thông báo thành công", notification));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi đăng ký thông báo: " + e.getMessage()));
        }
    }

    // Update notification
    @PutMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateNotification(
            @PathVariable Long notificationId,
            @RequestBody NotificationUpdateRequest request,
            Authentication authentication) {

        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();

        // Verify ownership - just check if exists
        if (notificationFesService.getUserFestivalNotification(userPrincipal.getId(), notificationId).isEmpty()) {
            throw new RuntimeException("Notification not found or access denied");
        }

        try {
            NotificationFes updated = notificationFesService.updateNotification(
                    notificationId, request.getNote(), request.getIsActive());
            return ResponseEntity.ok(ApiResponse.success("Cập nhật thông báo thành công", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi cập nhật thông báo: " + e.getMessage()));
        }
    }

    // Delete notification
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId, Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();

        // Verify ownership - just check if exists
        if (notificationFesService.getUserFestivalNotification(userPrincipal.getId(), notificationId).isEmpty()) {
            throw new RuntimeException("Notification not found or access denied");
        }

        try {
            notificationFesService.deleteNotification(notificationId);
            return ResponseEntity.ok(ApiResponse.success("Xóa thông báo thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi xóa thông báo: " + e.getMessage()));
        }
    }

    // Toggle notification status
    @PutMapping("/{notificationId}/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleNotificationStatus(@PathVariable Long notificationId, Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();

        // Verify ownership - just check if exists
        if (notificationFesService.getUserFestivalNotification(userPrincipal.getId(), notificationId).isEmpty()) {
            throw new RuntimeException("Notification not found or access denied");
        }

        try {
            NotificationFes updated = notificationFesService.toggleNotificationStatus(notificationId);
            return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái thành công", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi thay đổi trạng thái: " + e.getMessage()));
        }
    }

    // ADMIN ENDPOINTS

    // Get all notifications for a festival (admin only)
    @GetMapping("/admin/festival/{festivalId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getFestivalNotifications(@PathVariable Long festivalId) {
        List<NotificationFes> notifications = notificationFesService.getFestivalNotifications(festivalId);
        return ResponseEntity.ok(ApiResponse.success("Danh sách thông báo cho lễ hội", notifications));
    }

    // Get notifications in date range (admin only)
    @GetMapping("/admin/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<NotificationFes> notifications = notificationFesService.getNotificationsForFestivalsInDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Danh sách thông báo trong khoảng thời gian", notifications));
    }

    // Request DTOs
    public static class NotificationRequest {
        private String note;

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }
    }

    public static class NotificationUpdateRequest {
        private String note;
        private Boolean isActive;

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }
    }
}
