package api.tn.wiki.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class SentimentAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(SentimentAnalysisService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public SentimentAnalysisService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * Analyses the sentiment of a text using AI.
     * Returns a Map with "sentiment" (POSITIVE, NEGATIVE, NEUTRAL) and "score" (0.0 to 1.0).
     */
    public Map<String, Object> analyzeSentiment(String text, Integer rating) {
        // Intelligence hybride : si pas de texte, on se base sur la note
        if (text == null || text.trim().isEmpty()) {
            if (rating != null) {
                if (rating >= 4) return Map.of("sentiment", "POSITIVE", "score", 0.9);
                if (rating <= 2) return Map.of("sentiment", "NEGATIVE", "score", 0.9);
            }
            return Map.of("sentiment", "NEUTRAL", "score", 0.5);
        }

        try {
            ArrayNode messagesArray = objectMapper.createArrayNode();
            
            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", String.format(
                    "Tu es un expert en analyse de sentiment. Note que le client a donné une note de %d/5. " +
                    "Analyse le texte pour confirmer ou nuancer ce sentiment. " +
                    "Réponds UNIQUEMENT au format JSON : {\"sentiment\": \"POSITIVE|NEGATIVE|NEUTRAL\", \"score\": 0.0-1.0}.",
                    rating != null ? rating : 3));
            messagesArray.add(systemMsg);

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", text);
            messagesArray.add(userMsg);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", "gpt-4o-mini"); // Default model for analysis
            payload.set("messages", messagesArray);
            payload.set("response_format", objectMapper.createObjectNode().put("type", "json_object"));

            HttpRequest apiRequest = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl.trim()))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(apiRequest, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                JsonNode responseNode = objectMapper.readTree(response.body());
                String content = responseNode.get("choices").get(0).get("message").get("content").asText();
                JsonNode result = objectMapper.readTree(content);
                
                return Map.of(
                    "sentiment", result.get("sentiment").asText().toUpperCase(),
                    "score", result.get("score").asDouble()
                );
            }
        } catch (Exception e) {
            logger.error("Sentiment analysis failed: {}", e.getMessage());
        }

        // Fallback: Simple keyword based analysis if AI fails
        return fallbackAnalysis(text);
    }

    private Map<String, Object> fallbackAnalysis(String text) {
        String lowerText = text.toLowerCase();
        if (lowerText.contains("super") || lowerText.contains("excellent") || lowerText.contains("bravo") || lowerText.contains("parfait")) {
            return Map.of("sentiment", "POSITIVE", "score", 0.8);
        } else if (lowerText.contains("mauvais") || lowerText.contains("déçu") || lowerText.contains("horrible") || lowerText.contains("problème")) {
            return Map.of("sentiment", "NEGATIVE", "score", 0.8);
        }
        return Map.of("sentiment", "NEUTRAL", "score", 0.5);
    }
}
