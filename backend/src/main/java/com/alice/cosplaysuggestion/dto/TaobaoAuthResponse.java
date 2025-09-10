package com.alice.cosplaysuggestion.dto;

import lombok.Data;

@Data
public class TaobaoAuthResponse {
    private User user;
    private Long expires_in;
    private String access_token;
    
    @Data
    public static class User {
        private Long id;
        private String name;
        private String phone;
        private String email;
        private Integer plan;
        private String plan_title;
        private Integer request_fee;
        private Integer free_requests;
        private Integer max_cap_requests;
        private Integer max_cap_apps;
        private String website;
        private Boolean isActive;
        private String created_at;
        private String updated_at;
        private String deleted_at;
        private String expired_at;
    }
}
