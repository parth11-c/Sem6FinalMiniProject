package com.unified.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class PlagiarismService {
    private static final Logger logger = LoggerFactory.getLogger(PlagiarismService.class);

    @Value("${copyleaks.api.key}")
    private String apiKey;

    private static final String COPYLEAKS_API_URL = "https://api.copyleaks.com/v3/businesses/check";
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> checkPlagiarism(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            // Read file content
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            logger.info("Starting plagiarism check for content length: {}", content.length());

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", content);
            requestBody.put("properties", Map.of(
                "scanning", Map.of(
                    "internetSearch", true,
                    "repositories", true
                )
            ));

            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Create request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            // Make API call
            logger.info("Making API call to Copyleaks...");
            Map<String, Object> response = restTemplate.postForObject(
                COPYLEAKS_API_URL,
                requestEntity,
                Map.class
            );

            if (response == null) {
                throw new IOException("Null response from Copyleaks API");
            }

            // Extract plagiarism score
            Map<String, Object> result = new HashMap<>();
            double plagiarismScore = ((Number) response.get("score")).doubleValue();
            result.put("score", (int) plagiarismScore);
            result.put("originalContent", 100 - (int) plagiarismScore);

            logger.info("Plagiarism check completed. Score: {}", plagiarismScore);
            return result;

        } catch (Exception e) {
            logger.error("Error during plagiarism check: {}", e.getMessage(), e);
            throw new IOException("Error during plagiarism check: " + e.getMessage());
        }
    }
} 