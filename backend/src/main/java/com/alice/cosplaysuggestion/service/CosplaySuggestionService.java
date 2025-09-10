package com.alice.cosplaysuggestion.service;

import java.text.NumberFormat;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alice.cosplaysuggestion.ai.dto.ChatResponse;
import com.alice.cosplaysuggestion.ai.service.AIService;
import com.alice.cosplaysuggestion.dto.ApiResponse;
import com.alice.cosplaysuggestion.dto.CosplaySuggestionRequest;
import com.alice.cosplaysuggestion.dto.CosplaySuggestionResponse;
import com.alice.cosplaysuggestion.dto.TaobaoSearchResponse;
import com.alice.cosplaysuggestion.model.Account;
import com.alice.cosplaysuggestion.repository.AccountRepository;

@Service
public class CosplaySuggestionService {

    private static final Logger logger = LoggerFactory.getLogger(CosplaySuggestionService.class);

    @Autowired
    private AIService aiService;

    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private TaobaoService taobaoService;

    /**
     * Tạo gợi ý cosplay cho người dùng đã đăng nhập
     */
    public ApiResponse<CosplaySuggestionResponse> generateSuggestionForUser(
            Long userId, CosplaySuggestionRequest request) {
        
        try {
            // Lấy thông tin người dùng từ database
            Optional<Account> accountOpt = accountRepository.findById(userId);
            if (accountOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }

            Account account = accountOpt.get();
            
            // Sử dụng thông tin từ profile nếu có, không thì dùng thông tin từ request
            Double height = account.getHeight() != null ? account.getHeight() : request.getHeight();
            Double weight = account.getWeight() != null ? account.getWeight() : request.getWeight();
            String gender = account.getGender() != null ? account.getGender().toString() : request.getGender();

            return generateSuggestion(request, height, weight, gender);

        } catch (Exception e) {
            logger.error("Error generating cosplay suggestion for user {}: {}", userId, e.getMessage(), e);
            return ApiResponse.error("Failed to generate cosplay suggestion: " + e.getMessage());
        }
    }

    /**
     * Tạo gợi ý cosplay cho người dùng chưa đăng nhập
     */
    public ApiResponse<CosplaySuggestionResponse> generateSuggestionForGuest(CosplaySuggestionRequest request) {
        try {
            // Kiểm tra thông tin bắt buộc
            if (request.getHeight() == null || request.getWeight() == null || 
                request.getGender() == null || request.getGender().trim().isEmpty()) {
                return ApiResponse.error("Height, weight, and gender are required for guest users");
            }

            return generateSuggestion(request, request.getHeight(), request.getWeight(), request.getGender());

        } catch (Exception e) {
            logger.error("Error generating cosplay suggestion for guest: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to generate cosplay suggestion: " + e.getMessage());
        }
    }

    /**
     * Logic chính tạo gợi ý cosplay
     */
    private ApiResponse<CosplaySuggestionResponse> generateSuggestion(
            CosplaySuggestionRequest request, Double height, Double weight, String gender) {

        try {
            long startTime = System.currentTimeMillis();

            // Tạo prompt cho AI
            String prompt = buildCosplayPrompt(request, height, weight, gender);

            // Gọi AI service
            ApiResponse<ChatResponse> aiResponse = aiService.generateResponse(prompt, getCosplaySystemPrompt());

            if (!aiResponse.getSuccess() || aiResponse.getData() == null) {
                return ApiResponse.error("AI service failed to generate response");
            }

            // Parse response từ AI và tạo structured response
            CosplaySuggestionResponse suggestion = parseAIResponse(
                aiResponse.getData().getText(), 
                request.getCharacterName(),
                System.currentTimeMillis() - startTime
            );

            // Tìm kiếm sản phẩm cosplay từ Taobao bằng từ khóa AI tạo ra
            if (suggestion.getTaobaoKeywords() != null && !suggestion.getTaobaoKeywords().isEmpty()) {
                List<TaobaoSearchResponse.TaobaoProduct> taobaoProducts = taobaoService
                    .searchProductsByKeywords(suggestion.getTaobaoKeywords(), request.getBudget())
                    .block(); // Block để chờ kết quả

                // Convert Taobao products sang format của response
                if (taobaoProducts != null && !taobaoProducts.isEmpty()) {
                    List<CosplaySuggestionResponse.CosplayProduct> products = taobaoProducts.stream()
                        .map(this::convertTaobaoProduct)
                        .collect(Collectors.toList());
                    suggestion.setProducts(products);
                }
            } else {
                logger.warn("No Taobao keywords generated by AI for character: {}", request.getCharacterName());
            }

            return ApiResponse.success("Cosplay suggestion generated successfully", suggestion);

        } catch (Exception e) {
            logger.error("Error in generateSuggestion: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to generate cosplay suggestion: " + e.getMessage());
        }
    }

    /**
     * Convert Taobao product to response format
     */
    private CosplaySuggestionResponse.CosplayProduct convertTaobaoProduct(TaobaoSearchResponse.TaobaoProduct taobaoProduct) {
        CosplaySuggestionResponse.CosplayProduct product = new CosplaySuggestionResponse.CosplayProduct();
        product.setId(taobaoProduct.getId());
        product.setTitle(taobaoProduct.getTitle());
        product.setTitleEn(taobaoProduct.getTitleEn());
        product.setPrice(taobaoProduct.getPrice());
        product.setSeller_name(taobaoProduct.getSeller_name());
        product.setImg_url(taobaoProduct.getImg_url());
        product.setLink(taobaoProduct.getLink());
        
        // Convert CNY to VND (approximate rate: 1 CNY = 3500 VND)
        if (taobaoProduct.getPrice() != null) {
            product.setPriceVND(taobaoProduct.getPrice() * 3500);
        }
        
        return product;
    }

    /**
     * Tạo prompt chi tiết cho AI
     */
    private String buildCosplayPrompt(CosplaySuggestionRequest request, Double height, Double weight, String gender) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Tôi muốn cosplay nhân vật: ").append(request.getCharacterName()).append("\n");
        prompt.append("Thông tin cá nhân:\n");
        prompt.append("- Chiều cao: ").append(height).append(" cm\n");
        prompt.append("- Cân nặng: ").append(weight).append(" kg\n");
        prompt.append("- Giới tính: ").append(gender).append("\n");
        
        if (request.getBudget() != null && request.getBudget() > 0) {
            NumberFormat formatter = NumberFormat.getInstance(Locale.of("vi", "VN"));
            prompt.append("- Ngân sách: ").append(formatter.format(request.getBudget())).append(" VND\n");
        } else {
            prompt.append("- Ngân sách: Không giới hạn\n");
        }
        
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            prompt.append("- Ghi chú thêm: ").append(request.getNotes()).append("\n");
        }
        
        prompt.append("\nHãy phân tích chi tiết nhân vật này bao gồm:")
               .append("\n- Xuất xứ và bối cảnh (anime/game/manga nào)")
               .append("\n- Tính cách và đặc điểm nhân vật")
               .append("\n- Đặc điểm ngoại hình chi tiết (tóc, mắt, cao thấp, vóc dáng)")
               .append("\n- Trang phục đặc trưng và ý nghĩa")
               .append("\n- Các pose/biểu cảm đặc trưng")
               .append("\n- Mức độ phổ biến trong cộng đồng cosplay")
               .append("\nRồi đưa ra gợi ý cosplay toàn diện và thực tế cho tôi.");
        
        return prompt.toString();
    }

    /**
     * System prompt cho AI
     */
    private String getCosplaySystemPrompt() {
        return """
            Bạn là một chuyên gia cosplay chuyên nghiệp với kiến thức sâu rộng về anime, manga, game và văn hóa otaku. 
            Bạn hiểu rõ các nhân vật, bối cảnh, tính cách và ý nghĩa của từng series.
            
            Khi phân tích một nhân vật cosplay, hãy bao gồm đầy đủ các khía cạnh sau:
            1. Bối cảnh và xuất xứ nhân vật (series nào, thể loại, năm phát hành)
            2. Tính cách, đặc điểm tâm lý và vai trò trong câu chuyện
            3. Đặc điểm ngoại hình chi tiết (tóc, mắt, chiều cao ước tính, vóc dáng)
            4. Trang phục và phụ kiện đặc trưng (màu sắc, chất liệu, chi tiết)
            5. Các pose, biểu cảm và cử chỉ đặc trưng
            6. Mức độ phổ biến và độ khó thực hiện cosplay
            7. Phân tích sự phù hợp với thông số người cosplay
            
            Định dạng phản hồi theo cấu trúc sau:
            
            [CHARACTER_DESCRIPTION]
            Mô tả toàn diện về nhân vật bao gồm:
            - **Xuất xứ**: Tên series/anime/game, năm ra mắt, thể loại
            - **Vai trò**: Vị trí và tầm quan trọng trong câu chuyện  
            - **Tính cách**: Đặc điểm tâm lý, cách cư xử, sở thích
            - **Ngoại hình**: Mô tả chi tiết về tóc, mắt, chiều cao, vóc dáng
            - **Đặc điểm nổi bật**: Những yếu tố làm nên sự độc đáo của nhân vật
            - **Trang phục**: Mô tả chi tiết trang phục chính và các biến thể
            - **Phụ kiện**: Các vật dụng đặc trưng (vũ khí, trang sức, đồ dùng)
            - **Pose đặc trưng**: Các tư thế và biểu cảm nổi tiếng
            - **Mức độ phổ biến**: Tình trạng cosplay nhân vật này trong cộng đồng
            
            [DIFFICULTY_LEVEL] 
            EASY/MEDIUM/HARD (chỉ trả về 1 từ dựa trên độ phức tạp trang phục, makeup và props)
            
            [SUITABILITY_SCORE]
            Chỉ trả về một con số từ 1-10 (đánh giá mức độ phù hợp dựa trên thông số cơ thể và đặc điểm nhân vật)
            
            [BUDGET_ANALYSIS]
            Phân tích chi tiết về ngân sách:
            - **Ước tính tổng chi phí** (chia theo mục: trang phục, phụ kiện, makeup, props)
            - **So sánh với ngân sách đề ra** (có phù hợp không)
            - **Gợi ý tối ưu hóa** (cách tiết kiệm hoặc đầu tư thêm)
            - **Độ bền và tái sử dụng** của các item
            
            [RECOMMENDATIONS]
            Hướng dẫn chi tiết từng bước:
            - **Trang phục chính**: Nên mua hay may, shop nào uy tín, chất liệu nào tốt
            - **Phụ kiện**: Cách làm DIY hoặc mua ở đâu, thứ tự ưu tiên
            - **Makeup**: Các sản phẩm cần thiết, technique phù hợp
            - **Tóc/Wig**: Màu sắc, kiểu dáng, cách chăm sóc và tạo kiểu
            - **Props**: Cách chế tạo hoặc mua đạo cụ
            - **Contact lens**: Màu mắt phù hợp nếu cần
            
            [ITEMS_LIST]
            Checklist chi tiết theo thứ tự ưu tiên:
            * **Bắt buộc**: Các item không thể thiếu
            * **Quan trọng**: Các item nâng cao chất lượng cosplay  
            * **Tùy chọn**: Các item bonus để hoàn thiện
            * **DIY được**: Các item có thể tự làm tại nhà
            (Ghi rõ ước tính giá cho từng item)
            
            [TIPS]
            Kinh nghiệm và mẹo hay:
            - **Chuẩn bị trước event**: Timeline và checklist
            - **Mẹo makeup**: Technique đặc biệt cho nhân vật này
            - **Tạo dáng**: Cách pose và diễn xuất phù hợp
            - **Chăm sóc costume**: Bảo quản và vận chuyển
            - **Tương tác**: Cách thể hiện tính cách nhân vật
            - **Photography**: Góc chụp và lighting đẹp nhất
            
            [ALTERNATIVES]
            Gợi ý 2-3 nhân vật thay thế nếu không phù hợp:
            - **Nhân vật tương tự**: Cùng series hoặc cùng phong cách
            - **Nhân vật dễ hơn**: Giảm độ khó nhưng vẫn attractive  
            - **Nhân vật phù hợp hơn**: Match với thông số cơ thể
            (Giải thích lý do gợi ý mỗi nhân vật)
            
            [TAOBAO_KEYWORDS]
            Bắt buộc phải tạo 5-7 từ khóa tiếng Trung chính xác cho nhân vật này trên Taobao, mỗi từ khóa một dòng, và các từ khoá này là các từ khoá kết hợp tên nhân vật với cosplay,trang phục cosplay,tóc cosplay ,phụ kiện cosplay,...
            Chú ý: Phải đảm bảo tất cả từ khóa đều liên quan đến ĐÚNG nhân vật được yêu cầu, không được nhầm lẫn với nhân vật khác.
            
            **QUAN TRỌNG: Phải bao gồm đầy đủ TẤT CẢ 8 sections trên: [CHARACTER_DESCRIPTION], [DIFFICULTY_LEVEL], [SUITABILITY_SCORE], [BUDGET_ANALYSIS], [RECOMMENDATIONS], [ITEMS_LIST], [TIPS], [ALTERNATIVES], và [TAOBAO_KEYWORDS]. Không được bỏ sót section nào!**
            
            Hãy sử dụng tiếng Việt, đưa ra lời khuyên thực tế và có thể thực hiện.
            Thể hiện sự am hiểu sâu sắc về văn hóa anime/manga và cộng đồng cosplay Việt Nam.
            """;
    }

    /**
     * Parse response từ AI thành structured data
     */
    private CosplaySuggestionResponse parseAIResponse(String aiText, String characterName, long processingTime) {
        CosplaySuggestionResponse response = new CosplaySuggestionResponse();
        response.setCharacterName(characterName);
        response.setProcessingTimeMs(String.valueOf(processingTime));

        try {
            // Parse theo các section đã định nghĩa
            response.setCharacterDescription(extractSection(aiText, "CHARACTER_DESCRIPTION"));
            response.setDifficultyLevel(extractSection(aiText, "DIFFICULTY_LEVEL"));
            response.setSuitabilityScore(extractAndCleanScore(aiText, "SUITABILITY_SCORE"));
            response.setBudgetAnalysis(extractSection(aiText, "BUDGET_ANALYSIS"));
            response.setRecommendations(extractSection(aiText, "RECOMMENDATIONS"));
            response.setItemsList(extractSection(aiText, "ITEMS_LIST"));
            response.setTips(extractSection(aiText, "TIPS"));
            response.setAlternatives(extractSection(aiText, "ALTERNATIVES"));
            
            // Parse Taobao keywords từ AI response
            List<String> taobaoKeywords = extractTaobaoKeywords(aiText);
            response.setTaobaoKeywords(taobaoKeywords);

        } catch (Exception e) {
            logger.warn("Error parsing AI response, using raw text: {}", e.getMessage());
            // Fallback: nếu parse lỗi thì đưa toàn bộ text vào recommendations
            response.setRecommendations(aiText);
            response.setDifficultyLevel("MEDIUM");
            response.setSuitabilityScore("7");
            response.setTaobaoKeywords(List.of(characterName + " cosplay")); // Fallback keyword
        }

        return response;
    }

    /**
     * Extract section từ AI response
     */
    private String extractSection(String text, String sectionName) {
        try {
            String startTag = "[" + sectionName + "]";
            String nextSectionStart = "[";
            
            int startIndex = text.indexOf(startTag);
            if (startIndex == -1) return "";
            
            startIndex += startTag.length();
            
            // Tìm section tiếp theo
            int endIndex = text.indexOf(nextSectionStart, startIndex);
            if (endIndex == -1) {
                endIndex = text.length();
            }
            
            return text.substring(startIndex, endIndex).trim();
            
        } catch (Exception e) {
            logger.warn("Error extracting section {}: {}", sectionName, e.getMessage());
            return "";
        }
    }

    /**
     * Extract score và chỉ lấy số, loại bỏ mô tả
     */
    private String extractAndCleanScore(String text, String sectionName) {
        try {
            String rawScore = extractSection(text, sectionName);
            if (rawScore.isEmpty()) return "7"; // Default score
            
            // Tìm số đầu tiên trong text (từ 1-10)
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(10|[1-9])");
            java.util.regex.Matcher matcher = pattern.matcher(rawScore);
            
            if (matcher.find()) {
                return matcher.group(1);
            }
            
            return "7"; // Default nếu không tìm thấy số hợp lệ
            
        } catch (Exception e) {
            logger.warn("Error extracting score {}: {}", sectionName, e.getMessage());
            return "7";
        }
    }

    /**
     * Extract danh sách từ khóa Taobao từ AI response
     */
    private List<String> extractTaobaoKeywords(String text) {
        try {
            String keywordsSection = extractSection(text, "TAOBAO_KEYWORDS");
            if (keywordsSection.isEmpty()) {
                return Collections.emptyList();
            }
            
            // Split theo dòng và lọc các keyword hợp lệ
            List<String> keywords = keywordsSection.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                // Loại bỏ dòng đầu tiên (instruction) và dòng cuối (chúc mừng)
                .filter(line -> !line.contains("Tạo ra") && !line.contains("tìm kiếm") 
                            && !line.contains("Chúc") && !line.contains("thành công")
                            && !line.contains("câu hỏi") && !line.contains("đừng"))
                // Xử lý dòng có dấu - ở đầu
                .map(line -> line.startsWith("- ") ? line.substring(2).trim() : line)
                // Chỉ giữ lại những dòng có chứa ký tự Trung Quốc hoặc từ cosplay
                .filter(line -> line.matches(".*[\\u4e00-\\u9fff].*") || 
                            line.toLowerCase().contains("cosplay") || 
                            line.toLowerCase().contains("cos"))
                .limit(7) // Giới hạn tối đa 7 keywords
                .collect(Collectors.toList());
                
            return keywords;
                
        } catch (Exception e) {
            logger.warn("Error extracting Taobao keywords: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
