package api.tn.wiki.service;

import api.tn.wiki.dto.chat.ChatRequest;
import api.tn.wiki.dto.chat.ChatResponse;
import api.tn.wiki.dto.response.ProductResponse;
import api.tn.wiki.dto.response.ProductMinResponse;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public ChatService(ProductService productService, ObjectMapper objectMapper) {
        this.productService = productService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public ChatResponse processChat(ChatRequest request) throws Exception {
        if ("YOUR_OPENAI_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty()) {
            return new ChatResponse("Désolé, la clé API OpenAI n'est pas configurée. Veuillez configurer 'openai.api.key' dans le backend.");
        }


        // Preparation of messages for OpenAI
        ArrayNode messagesArray = objectMapper.createArrayNode();
        
        // System prompt
        ObjectNode systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", "Tu es Wiki Bot, l'expert conseiller de Wiki (Tunisie), leader du High-Tech. " +
                "Ton objectif : convertir les visiteurs en clients satisfaits par des conseils techniques précis. " +
                "STRATÉGIE DE RECHERCHE : " +
                "1. Utilise TOUJOURS 'search_products' pour toute demande de produit. " +
                "2. Si une recherche échoue (ex: 'PC Gamer MSI'), essaie immédiatement des variantes : juste la marque ('MSI'), juste la catégorie ('PC Gamer'), ou des termes synonymes ('Laptop', 'Ordinateur'). " +
                "3. Pour les marques courtes (HP, MSI, ASUS), assure-toi de bien utiliser le nom exact. " +
                "TON TON : Professionnel, enthousiaste et expert. Cite toujours les prix en DT (Dinar Tunisien). " +
                "RÉPONSE : Sois concis. Si tu trouves des produits, vends leurs points forts (puissance, écran, prix). Réponds toujours en français.");
        messagesArray.add(systemMsg);

        // History
        for (ChatRequest.ChatMessage msg : request.getMessages()) {
            ObjectNode m = objectMapper.createObjectNode();
            m.put("role", msg.getRole());
            m.put("content", msg.getContent() == null ? "" : msg.getContent());
            messagesArray.add(m);
        }

        // Define tools (Function Calling)
        ArrayNode tools = objectMapper.createArrayNode();
        ObjectNode tool = objectMapper.createObjectNode();
        tool.put("type", "function");
        ObjectNode function = objectMapper.createObjectNode();
        function.put("name", "search_products");
        function.put("description", "Recherche des produits dans le catalogue Wiki. Astuce : si une recherche spécifique ne donne rien, essaie des mots-clés plus larges (ex: 'Asus' au lieu de 'Asus Rog Strix').");
        ObjectNode parameters = objectMapper.createObjectNode();
        parameters.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode queryProp = objectMapper.createObjectNode();
        queryProp.put("type", "string");
        queryProp.put("description", "Le terme de recherche (ex: 'PC gamer asus', 'iPhone 15', 'souris logitech')");
        properties.set("query", queryProp);
        parameters.set("properties", properties);
        ArrayNode required = objectMapper.createArrayNode();
        required.add("query");
        parameters.set("required", required);
        function.set("parameters", parameters);
        tool.set("function", function);
        tools.add(tool);

        // Build Payload
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", messagesArray);
        // Réactivé car le modèle dynamiquement sélectionné par OpenRouter supporte les tools
        payload.set("tools", tools);
        payload.put("tool_choice", "auto");
        logger.info("Calling AI API at: {} with model: {}", apiUrl, model);

        // API Call
        HttpRequest apiRequest = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl.trim()))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:3000")
                .header("X-Title", "Wiki Bot")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(apiRequest, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            logger.error("OpenAI API error: {} - {}", response.statusCode(), response.body());
            return new ChatResponse("Erreur lors de la communication avec l'IA. Code: " + response.statusCode());
        }


        JsonNode responseNode = objectMapper.readTree(response.body());
        JsonNode choice = responseNode.get("choices").get(0);
        JsonNode messageNode = choice.get("message");
        
        String assistantContent = messageNode.has("content") && !messageNode.get("content").isNull() ? messageNode.get("content").asText() : "";
        List<ChatResponse.ProductRecommendation> recommendations = new ArrayList<>();

        // Handle tool calls with a second API call
        if (messageNode.has("tool_calls")) {
            // Append the assistant's message with tool_calls to the conversation
            ObjectNode assistantMsg = objectMapper.createObjectNode();
            assistantMsg.put("role", "assistant");
            String textContent = "";
            if (messageNode.has("content") && !messageNode.get("content").isNull()) {
                textContent = messageNode.get("content").asText();
            }
            assistantMsg.put("content", textContent);
            assistantMsg.set("tool_calls", messageNode.get("tool_calls"));
            messagesArray.add(assistantMsg);

            boolean toolExecuted = false;

            for (JsonNode toolCall : messageNode.get("tool_calls")) {
                String toolCallId = toolCall.has("id") && !toolCall.get("id").isNull() ? toolCall.get("id").asText() : null;
                if (toolCallId == null) continue;

                String contentResult = "Tool non supporté ou erreur interne.";
                String toolName = "unknown_tool";

                if (toolCall.has("type") && "function".equals(toolCall.get("type").asText())) {
                    JsonNode func = toolCall.get("function");
                    if (func != null && func.has("name")) {
                        toolName = func.get("name").asText();
                        if ("search_products".equals(toolName)) {
                            String query = "";
                            ArrayNode productsJson = objectMapper.createArrayNode();
                            try {
                                if (func.has("arguments") && !func.get("arguments").isNull()) {
                                    JsonNode argsNode = func.get("arguments");
                                    if (argsNode.isObject()) {
                                        if (argsNode.has("query")) {
                                            query = argsNode.get("query").asText();
                                        }
                                    } else if (argsNode.isTextual()) {
                                        String argsStr = argsNode.asText();
                                        if (argsStr != null && !argsStr.trim().isEmpty() && !argsStr.equals("{}")) {
                                            JsonNode args = objectMapper.readTree(argsStr);
                                            if (args != null && args.has("query")) {
                                                query = args.get("query").asText();
                                            }
                                        }
                                    }
                                }
                                
                                logger.info("WikiBot tool search: '{}'", query);
                                if (!query.trim().isEmpty()) {
                                    List<ProductMinResponse> products = productService.searchProducts(query, null, null, null);
                                    if (products != null && !products.isEmpty()) {
                                        logger.info("WikiBot found {} products", products.size());
                                        for (ProductMinResponse p : products.stream().limit(5).collect(Collectors.toList())) {
                                            recommendations.add(new ChatResponse.ProductRecommendation(
                                                    p.getId(), p.getTitle(), p.getSlug(),
                                                    p.getDiscountPrice() != null && p.getDiscountPrice() > 0 ? p.getDiscountPrice() : p.getRegularPrice(),
                                                    p.getImageUrl()
                                            ));
                                            ObjectNode pObj = objectMapper.createObjectNode();
                                            pObj.put("title", p.getTitle());
                                            pObj.put("price", p.getDiscountPrice() != null && p.getDiscountPrice() > 0 ? p.getDiscountPrice() : p.getRegularPrice());
                                            productsJson.add(pObj);
                                        }
                                    }
                                }
                                contentResult = productsJson.isEmpty() ? "Aucun produit trouvé. Essayez des termes plus simples." : productsJson.toString();
                            } catch (Exception e) {
                                logger.error("ChatBot tool execution error: {}", e.getMessage());
                            }
                            toolExecuted = true;
                        }
                    }
                }
                
                ObjectNode toolMsg = objectMapper.createObjectNode();
                toolMsg.put("role", "tool");
                toolMsg.put("tool_call_id", toolCallId);
                // "name" is NOT allowed in tool messages by OpenAI API schema
                toolMsg.put("content", contentResult);
                messagesArray.add(toolMsg);
            }
            
            // Second API Call if a tool was executed
            if (toolExecuted) {
                ObjectNode payload2 = objectMapper.createObjectNode();
                payload2.put("model", model);
                payload2.set("messages", messagesArray);
                payload2.set("tools", tools); // Include tools in the second pass too
                
                logger.info("Calling AI API (Second Pass) at: {}", apiUrl);
                
                HttpRequest apiRequest2 = HttpRequest.newBuilder()
                        .uri(URI.create(apiUrl.trim()))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("HTTP-Referer", "http://localhost:3000")
                        .header("X-Title", "Wiki Bot")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload2)))
                        .build();

                HttpResponse<String> response2 = httpClient.send(apiRequest2, HttpResponse.BodyHandlers.ofString());
                
                if (response2.statusCode() == 200) {
                    JsonNode responseNode2 = objectMapper.readTree(response2.body());
                    JsonNode choice2 = responseNode2.get("choices").get(0);
                    JsonNode messageNode2 = choice2.get("message");
                    assistantContent = messageNode2.has("content") && !messageNode2.get("content").isNull() 
                            ? messageNode2.get("content").asText() 
                            : "";
                } else {
                    logger.error("OpenAI API error on second pass: {} - {}", response2.statusCode(), response2.body());
                    if (assistantContent == null || assistantContent.isEmpty()) {
                        assistantContent = "Voici les meilleurs choix que j'ai pu trouver pour toi !";
                    }
                }
            }
        }

        if (assistantContent == null || assistantContent.trim().isEmpty()) {
            if (!recommendations.isEmpty()) {
                assistantContent = "Voici ce que j'ai trouvé pour vous :";
            } else {
                assistantContent = "Désolé, je n'ai pas pu formuler une réponse. Pourriez-vous reformuler ?";
            }
        }

        return new ChatResponse(assistantContent, recommendations);

    }
}
