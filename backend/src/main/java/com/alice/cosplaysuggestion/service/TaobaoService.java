package com.alice.cosplaysuggestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.alice.cosplaysuggestion.dto.TaobaoAuthRequest;
import com.alice.cosplaysuggestion.dto.TaobaoAuthResponse;
import com.alice.cosplaysuggestion.dto.TaobaoSearchRequest;
import com.alice.cosplaysuggestion.dto.TaobaoSearchResponse;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class TaobaoService {

    private final WebClient taobaoWebClient;
    private String accessToken = null;
    
    // Credentials from application.properties
    @Value("${taobao.api.email}")
    private String email;
    
    @Value("${taobao.api.password}")
    private String password;
    
    public TaobaoService(@Qualifier("taobaoWebClient") WebClient taobaoWebClient) {
        this.taobaoWebClient = taobaoWebClient;
    }
    
    // Login to get access token
    private Mono<String> getAccessToken() {
        if (accessToken != null) {
            return Mono.just(accessToken);
        }
        
        TaobaoAuthRequest authRequest = new TaobaoAuthRequest();
        authRequest.setEmail(email);
        authRequest.setPassword(password);
        
        return taobaoWebClient.post()
                .uri("/v1/auth/login")
                .bodyValue(authRequest)
                .retrieve()
                .bodyToMono(TaobaoAuthResponse.class)
                .map(response -> {
                    this.accessToken = response.getAccess_token();
                    return this.accessToken;
                })
                .doOnError(error -> log.error("❌ Failed to get Taobao access token", error));
    }
    
    // Search products using Chinese keywords provided by Gemini AI
    public Mono<List<TaobaoSearchResponse.TaobaoProduct>> searchProductsByKeywords(List<String> chineseKeywords, Double maxBudget) {
        if (chineseKeywords == null || chineseKeywords.isEmpty()) {
            log.warn("⚠️ No keywords provided for search");
            return Mono.just(List.of());
        }

        return getAccessToken()
                .flatMap(token -> {
                    // Thử từng keyword cho đến khi tìm thấy sản phẩm
                    return searchWithMultipleKeywords(token, chineseKeywords, maxBudget);
                })
                .doOnError(error -> log.error("❌ Failed to search Taobao products", error))
                .onErrorReturn(List.of());
    }
    
    // Thử search với nhiều keywords cho đến khi tìm thấy sản phẩm
    private Mono<List<TaobaoSearchResponse.TaobaoProduct>> searchWithMultipleKeywords(String token, List<String> keywords, Double maxBudget) {
        return searchWithKeywordsList(token, keywords, maxBudget, 0);
    }
    
    // Recursive method để thử từng keyword
    private Mono<List<TaobaoSearchResponse.TaobaoProduct>> searchWithKeywordsList(String token, List<String> keywords, Double maxBudget, int index) {
        if (index >= keywords.size()) {
            log.warn("⚠️ No products found with any of the provided keywords");
            return Mono.just(List.of());
        }
        
        String currentKeyword = keywords.get(index);
        return searchWithKeyword(token, currentKeyword, maxBudget)
                .flatMap(products -> {
                    if (products != null && !products.isEmpty()) {
                        return Mono.just(products);
                    } else {
                        return searchWithKeywordsList(token, keywords, maxBudget, index + 1);
                    }
                });
    }
    
    // Search with a single keyword
    private Mono<List<TaobaoSearchResponse.TaobaoProduct>> searchWithKeyword(String token, String keyword, Double maxBudget) {
        log.info("🔎 Searching with keyword: {}", keyword);
        
        TaobaoSearchRequest request = new TaobaoSearchRequest();
        request.setQ(keyword);
        request.setPlatform("taobao");
        request.setLang("vi");
        request.setSort("PRICE_ASC");
        request.setPage(1);
        request.setSize(20);
        
        // Set price filter if budget specified
        if (maxBudget != null && maxBudget > 0) {
            TaobaoSearchRequest.FilterOptions filter = new TaobaoSearchRequest.FilterOptions();
            TaobaoSearchRequest.FilterOptions.PriceRange priceRange = new TaobaoSearchRequest.FilterOptions.PriceRange();
            priceRange.setMin(0.0);
            priceRange.setMax(maxBudget);
            filter.setPrice_range(priceRange);
            filter.setAllow_return(true);
            filter.setAllow_dropship(true);
            request.setFilter(filter);
        }
        
        return taobaoWebClient.post()
                .uri("/v1/products/search")
                .header("Authorization", "Bearer " + token)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(TaobaoSearchResponse.class)
                .map(response -> {
                    if (response != null && response.getItems() != null) {
                        List<TaobaoSearchResponse.TaobaoProduct> products = response.getItems();
                        log.info("📦 Found {} products for keyword: {}", products.size(), keyword);
                        
                        // Apply budget filter if not already applied in request
                        if (maxBudget != null && maxBudget > 0) {
                            products = products.stream()
                                    .filter(product -> product.getPrice() != null && product.getPrice() <= maxBudget)
                                    .collect(Collectors.toList());
                            log.info("💰 After budget filter: {} products", products.size());
                        }
                        
                        return products;
                    } else {
                        log.warn("⚠️ No products found for keyword: {}", keyword);
                        return List.<TaobaoSearchResponse.TaobaoProduct>of();
                    }
                })
                .onErrorResume(error -> {
                    log.error("❌ Error searching with keyword '{}': {}", keyword, error.getMessage());
                    return Mono.just(List.<TaobaoSearchResponse.TaobaoProduct>of());
                });
    }
}