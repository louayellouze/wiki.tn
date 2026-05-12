package api.tn.wiki.controller;

import api.tn.wiki.dto.chat.ChatRequest;
import api.tn.wiki.dto.chat.ChatResponse;
import api.tn.wiki.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "${app.cors.allowed-origins}") // Restrict to front-office domains
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        System.out.println("ChatController: GET /ping received");
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askWikiBot(@RequestBody ChatRequest request) {
        System.out.println("ChatController: POST /ask received with " + (request.getMessages() != null ? request.getMessages().size() : 0) + " messages");
        try {
            ChatResponse response = chatService.processChat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(
                    new ChatResponse("Oups ! Wiki Bot a eu un problème technique : " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "inconnue") + " | Type: " + e.getClass().getSimpleName())
            );
        }
    }
}
