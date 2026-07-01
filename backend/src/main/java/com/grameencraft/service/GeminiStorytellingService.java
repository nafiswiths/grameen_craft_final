package com.grameencraft.service;

import com.grameencraft.dto.StoryRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiStorytellingService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateHeritageStory(StoryRequest request) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            return getFallbackStory(request);
        }

        try {
            // REST Endpoint for Google Gemini Generative AI API
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = String.format(
                "Write a beautiful, poetic, and heartwarming storytelling description for a traditional handmade craft called \"%s\" (Category: %s) crafted by artisan \"%s\" from the %s district of Bangladesh. " +
                "Include elements of cultural heritage (like the historic origin, raw materials like jute, bamboo, cotton, or clay, and traditional stitching/weaving/molding methods). " +
                "Ensure the tone is warm, elegant, and authentic, emphasizing how this product supports rural artisans and preserves Bangladesh's heritage. " +
                "Keep it engaging and under 150 words.",
                request.getProductName(),
                request.getCategory() != null ? request.getCategory() : "rural",
                request.getArtisanName(),
                request.getArtisanDistrict() != null ? request.getArtisanDistrict() : "rural"
            );

            // Construct Gemini Request JSON Payload structure
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contentMap = new HashMap<>();
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", prompt);
            contentMap.put("parts", List.of(partMap));
            requestBody.put("contents", List.of(contentMap));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse the response structure safely
                List candidates = (List) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map content = (Map) firstCandidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            return (String) firstPart.get("text");
                        }
                    }
                }
            }

            return getFallbackStory(request);
        } catch (Exception e) {
            System.err.println("Error calling Gemini API in Spring Boot: " + e.getMessage());
            return getFallbackStory(request);
        }
    }

    private String getFallbackStory(StoryRequest request) {
        String name = request.getProductName();
        String artisan = request.getArtisanName();
        String district = request.getArtisanDistrict() != null ? request.getArtisanDistrict() : "rural Bangladesh";

        if (name != null && name.toLowerCase().contains("katha")) {
            return String.format("This exquisite quilt is a canvas of dreams woven together by %s from %s. Passed down through maternal lineages, each tiny running stitch represents an evening of laughter, rain, and quiet resilience, telling stories of monsoon nights and golden harvests of Bengal.", artisan, district);
        } else if (name != null && name.toLowerCase().contains("jute")) {
            return String.format("Crafted from golden jute fibers by %s in %s, this bag carries the essence of the Shitalakshya riverbanks. Hand-spun, organic, and dyed with plant extracts, it represents the heart of eco-friendly, timeless Bengali craftsmanship.", artisan, district);
        } else if (name != null && (name.toLowerCase().contains("clay") || name.toLowerCase().contains("pot") || name.toLowerCase().contains("terracotta"))) {
            return String.format("Molded on the potter's wheel by %s from %s, these clay creations capture the ancient soul of clay. Baked in traditional earthen kilns, every curve is a testament to generations of rich pottery heritage.", artisan, district);
        } else if (name != null && (name.toLowerCase().contains("bamboo") || name.toLowerCase().contains("basket"))) {
            return String.format("Hand-plaited from wild green bamboo by %s in %s, this craft is a marvel of rural engineering. Light, durable, and organic, it carries the whispers of tea garden winds and rural simple living.", artisan, district);
        }

        return String.format("This exquisite creation was hand-crafted by %s utilizing traditional methods passed down through generations in %s. Each piece is completely unique, carrying the authentic heritage, spirit, and warmth of village craftsmanship.", artisan, district);
    }
}
