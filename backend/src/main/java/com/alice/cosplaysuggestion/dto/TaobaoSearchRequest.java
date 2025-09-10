package com.alice.cosplaysuggestion.dto;

import lombok.Data;

@Data
public class TaobaoSearchRequest {
    private String q;
    private String platform = "taobao";
    private String lang = "vi";
    private String sort = "PRICE_ASC"; // Sort by price ascending
    private Integer page = 1;
    private Integer size = 20;
    private FilterOptions filter;
    
    @Data
    public static class FilterOptions {
        private PriceRange price_range;
        private Boolean allow_return = true;
        private Boolean allow_dropship = true;
        
        @Data
        public static class PriceRange {
            private Double min;
            private Double max;
        }
    }
}
