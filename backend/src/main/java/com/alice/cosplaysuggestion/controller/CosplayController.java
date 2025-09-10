package com.alice.cosplaysuggestion.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.cosplaysuggestion.dto.ApiResponse;
import com.alice.cosplaysuggestion.dto.CosplaySuggestionRequest;
import com.alice.cosplaysuggestion.dto.CosplaySuggestionResponse;
import com.alice.cosplaysuggestion.service.CosplaySuggestionService;
import com.alice.cosplaysuggestion.service.UserDetailsServiceImpl.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cosplay")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://main.d3gxp9k6k5djri.amplifyapp.com",
        "https://cosplaysg.ddns.net"
    },
    allowCredentials = "true",
    maxAge = 3600
)
public class CosplayController {

    private static final Logger logger = LoggerFactory.getLogger(CosplayController.class);

    @Autowired
    private CosplaySuggestionService cosplaySuggestionService;

    /**
     * Tạo gợi ý cosplay cho người dùng đã đăng nhập
     */
    @PostMapping("/suggestion")
    public ResponseEntity<ApiResponse<CosplaySuggestionResponse>> generateSuggestion(
            @Valid @RequestBody CosplaySuggestionRequest request,
            Authentication authentication) {

        try {
            ApiResponse<CosplaySuggestionResponse> response;

            if (authentication != null && authentication.isAuthenticated()) {
                // Người dùng đã đăng nhập
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                Long userId = userPrincipal.getId();
                
                logger.info("Generating cosplay suggestion for user ID: {}", userId);
                response = cosplaySuggestionService.generateSuggestionForUser(userId, request);
            } else {
                // Người dùng chưa đăng nhập (guest)
                logger.info("Generating cosplay suggestion for guest user");
                response = cosplaySuggestionService.generateSuggestionForGuest(request);
            }

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Error in generateSuggestion controller: {}", e.getMessage(), e);
            ApiResponse<CosplaySuggestionResponse> errorResponse = 
                ApiResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Endpoint để test AI connection
     */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<String>> testAI(@RequestBody String message) {
        try {
            // Simple test để kiểm tra AI service
            CosplaySuggestionRequest testRequest = new CosplaySuggestionRequest();
            testRequest.setCharacterName(message);
            testRequest.setHeight(170.0);
            testRequest.setWeight(60.0);
            testRequest.setGender("FEMALE");
            testRequest.setBudget(1000000.0);

            ApiResponse<CosplaySuggestionResponse> result = 
                cosplaySuggestionService.generateSuggestionForGuest(testRequest);

            if (result.getSuccess()) {
                return ResponseEntity.ok(ApiResponse.success("AI test successful", "Connected to Gemini AI"));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("AI test failed: " + result.getMessage()));
            }

        } catch (Exception e) {
            logger.error("Error testing AI: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("AI test error: " + e.getMessage()));
        }
    }
}
