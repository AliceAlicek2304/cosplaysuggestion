package com.alice.cosplaysuggestion.dto;

import java.util.List;

import lombok.Data;

@Data
public class TaobaoSearchResponse {
    private Boolean success;
    private Integer code;
    private String message;
    private Paginate paginate;
    private List<TaobaoProduct> items;
    
    @Data
    public static class Paginate {
        private Integer current;
        private Integer size;
    }
    
    @Data
    public static class TaobaoProduct {
        private Long id;
        private String title;
        private String titleEn;
        private Double price;
        private String seller_name;
        private String seller_type;
        private String unit;
        private String img_url;
        private String link;
        private String sales_volume;
        private String retention_rate;
        private String level;
    }
}
