package com.alice.cosplaysuggestion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class TaobaoConfig {
    
    @Bean(name = "taobaoWebClient")
    public WebClient taobaoWebClient() {
        return WebClient.builder()
                .baseUrl("https://openapi.elim.asia")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
