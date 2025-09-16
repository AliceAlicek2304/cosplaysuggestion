package com.alice.cosplaysuggestion.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.alice.cosplaysuggestion.service.FestivalService;

@RestController
@RequestMapping("/api/festivals")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://main.d3gxp9k6k5djri.amplifyapp.com",
        "https://cosplaysg.ddns.net"
    },
    allowCredentials = "true",
    maxAge = 3600
)
public class FestivalController {

    private final FestivalService festivalService;

    public FestivalController(FestivalService festivalService) {
        this.festivalService = festivalService;
    }

    // Get all active festivals (public)
    @GetMapping("/active")
    public ResponseEntity<?> getActiveFestivals() {
        List<Festival> festivals = festivalService.getAllActiveFestivals();
        return ResponseEntity.ok(ApiResponse.success("Danh sách lễ hội đang hoạt động", festivals));
    }

    // Get upcoming festivals (public)
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingFestivals() {
        List<Festival> festivals = festivalService.getUpcomingFestivals();
        return ResponseEntity.ok(ApiResponse.success("Danh sách lễ hội sắp tới", festivals));
    }

    // Search festivals by name (public)
    @GetMapping("/search")
    public ResponseEntity<?> searchFestivals(@RequestParam(required = false) String name) {
        List<Festival> festivals = festivalService.searchFestivalsByName(name);
        return ResponseEntity.ok(ApiResponse.success("Kết quả tìm kiếm", festivals));
    }

    // Get festivals in date range (public)
    @GetMapping("/date-range")
    public ResponseEntity<?> getFestivalsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Festival> festivals = festivalService.getFestivalsInDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Danh sách lễ hội trong khoảng thời gian", festivals));
    }

    // Get festival by ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<?> getFestivalById(@PathVariable Long id) {
        return festivalService.getFestivalById(id)
                .map(festival -> ResponseEntity.ok(ApiResponse.success("Thông tin lễ hội", festival)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN ENDPOINTS

    // Get all festivals (admin only)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllFestivals() {
        List<Festival> festivals = festivalService.getAllFestivals();
        return ResponseEntity.ok(ApiResponse.success("Tất cả lễ hội", festivals));
    }

    // Create new festival (admin only)
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFestival(@RequestBody Festival festival) {
        try {
            Festival createdFestival = festivalService.createFestival(festival);
            return ResponseEntity.ok(ApiResponse.success("Tạo lễ hội thành công", createdFestival));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi tạo lễ hội: " + e.getMessage()));
        }
    }

    // Update festival (admin only)
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFestival(@PathVariable Long id, @RequestBody Festival festivalDetails) {
        try {
            Festival updatedFestival = festivalService.updateFestival(id, festivalDetails);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật lễ hội thành công", updatedFestival));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi cập nhật lễ hội: " + e.getMessage()));
        }
    }

    // Delete festival (admin only)
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFestival(@PathVariable Long id) {
        try {
            festivalService.deleteFestival(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa lễ hội thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi xóa lễ hội: " + e.getMessage()));
        }
    }

    // Toggle festival status (admin only)
    @PutMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleFestivalStatus(@PathVariable Long id) {
        try {
            Festival festival = festivalService.toggleFestivalStatus(id);
            return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái thành công", festival));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi thay đổi trạng thái: " + e.getMessage()));
        }
    }
}
