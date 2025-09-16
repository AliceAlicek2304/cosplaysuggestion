package com.alice.cosplaysuggestion.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.alice.cosplaysuggestion.service.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;
    
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth
                    // === PUBLIC ENDPOINTS (No Authentication Required) ===
                    
                    // Authentication endpoints - public
                    .requestMatchers("/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/test").permitAll()
                    .requestMatchers("/api/auth/forgot-password").permitAll()
                    .requestMatchers("/api/auth/reset-password").permitAll()
                    .requestMatchers("/api/auth/verify-email").permitAll()
                    
                    // Account registration and utility endpoints - public  
                    .requestMatchers("/api/account/register").permitAll()
                    .requestMatchers("/api/account/check-username").permitAll()
                    .requestMatchers("/api/account/check-email").permitAll()
                    
                    // Avatar files - public (no authentication required for viewing avatars)
                    .requestMatchers("/api/account/avatar/**").permitAll()
                    
                    // Background images - public
                    .requestMatchers("/api/background/**").permitAll()
                    // Gallery public GET
                    .requestMatchers(GET, "/api/gallery/**").permitAll()
                    
                    // Festival public GET endpoints
                    .requestMatchers(GET, "/api/festivals/active").permitAll()
                    .requestMatchers(GET, "/api/festivals/upcoming").permitAll()
                    .requestMatchers(GET, "/api/festivals/search").permitAll()
                    .requestMatchers(GET, "/api/festivals/date-range").permitAll()
                    .requestMatchers(GET, "/api/festivals/{id}").permitAll()
                    
                    // === COSPLAY SUGGESTION ENDPOINTS ===
                    
                    // Cosplay suggestion - can be used by both authenticated and guest users
                    .requestMatchers("/api/cosplay/suggestion").permitAll()
                    .requestMatchers("/api/cosplay/test").permitAll()
                    
                    // === PROTECTED ENDPOINTS (Authentication Required) ===
                    
                    // Account management - requires authentication
                    .requestMatchers("/api/account/resend-verification").authenticated()
                    .requestMatchers("/api/account/profile").authenticated()
                    .requestMatchers("/api/account/change-password").authenticated()
                    .requestMatchers("/api/account/change-email").authenticated()
                    .requestMatchers("/api/account/upload-avatar").authenticated()
                    .requestMatchers("/api/account/{id}").hasRole("ADMIN")
                    
                    // Admin endpoints - require ADMIN role
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers(POST, "/api/gallery/**").hasRole("ADMIN")
                    .requestMatchers(PUT, "/api/gallery/**").hasRole("ADMIN")
                    .requestMatchers(DELETE, "/api/gallery/**").hasRole("ADMIN")
                    
                    // Festival admin endpoints - require ADMIN role
                    .requestMatchers("/api/festivals/admin/**").hasRole("ADMIN")
                    
                    // Notification authenticated endpoints - require authentication
                    .requestMatchers("/api/notifications/fes/my").authenticated()
                    .requestMatchers("/api/notifications/fes/my/upcoming").authenticated()
                    .requestMatchers(POST, "/api/notifications/fes/festival/**").authenticated()
                    .requestMatchers(PUT, "/api/notifications/fes/**").authenticated()
                    .requestMatchers(DELETE, "/api/notifications/fes/**").authenticated()
                    
                    // Notification admin endpoints - require ADMIN role
                    .requestMatchers("/api/notifications/fes/admin/**").hasRole("ADMIN")
                    
                    // === DOCUMENTATION & MONITORING ===
                    
                    // Swagger/OpenAPI documentation - public
                    .requestMatchers("/swagger-ui/**").permitAll()
                    .requestMatchers("/v3/api-docs/**").permitAll()
                    .requestMatchers("/swagger-resources/**").permitAll()
                    .requestMatchers("/webjars/**").permitAll()
                    
                    // Health check endpoints - public
                    .requestMatchers("/actuator/health").permitAll()
                    
                    // Public API endpoints for future use
                    .requestMatchers("/api/public/**").permitAll()
                    
                    // === DEFAULT ===
                    // All other requests require authentication
                    .anyRequest().authenticated()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
