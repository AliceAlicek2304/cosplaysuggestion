package com.alice.cosplaysuggestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CosplaySuggestionRequest {
    
    private String characterName; // Tên nhân vật tìm kiếm
    private Double budget; // Ngân sách (VND)
    private Double height; // Chiều cao (cm) - nếu không có trong profile
    private Double weight; // Cân nặng (kg) - nếu không có trong profile  
    private String gender; // Giới tính - nếu không có trong profile
    private String notes; // Ghi chú thêm từ người dùng
    
    // Constructor khi có thông tin người dùng từ profile
    public CosplaySuggestionRequest(String characterName, Double budget, String notes) {
        this.characterName = characterName;
        this.budget = budget;
        this.notes = notes;
    }
}
