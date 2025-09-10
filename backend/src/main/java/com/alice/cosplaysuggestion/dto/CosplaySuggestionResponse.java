package com.alice.cosplaysuggestion.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CosplaySuggestionResponse {
    
    private String characterName; // Tên nhân vật được phân tích
    private String characterDescription; // Mô tả nhân vật
    private String difficultyLevel; // Độ khó cosplay (EASY, MEDIUM, HARD)
    private String suitabilityScore; // Điểm phù hợp (1-10)
    private String budgetAnalysis; // Phân tích ngân sách
    private String recommendations; // Gợi ý chi tiết
    private String itemsList; // Danh sách vật phẩm cần thiết
    private String tips; // Mẹo cosplay
    private String alternatives; // Gợi ý nhân vật thay thế nếu không phù hợp
    private List<String> taobaoKeywords; // Từ khóa tiếng Trung để search Taobao
    private String processingTimeMs; // Thời gian xử lý
    private List<CosplayProduct> products; // Danh sách sản phẩm từ Taobao
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CosplayProduct {
        private Long id;
        private String title;
        private String titleEn;
        private Double price;
        private String seller_name;
        private String img_url;
        private String link;
        private Double priceVND; // Giá quy đổi ra VND
    }
}
