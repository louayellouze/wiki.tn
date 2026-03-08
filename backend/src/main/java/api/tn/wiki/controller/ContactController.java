package api.tn.wiki.controller;

import api.tn.wiki.entity.ContactMessage;
import api.tn.wiki.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
@CrossOrigin
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    public ContactController(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendContactMessage(@RequestBody ContactMessage contactMessage) {
        System.out.println("Received contact message: " + contactMessage);
        try {
            if (contactMessage.getEmail() == null) {
                System.out.println("ERROR: Email is null in the received object!");
            }
            return ResponseEntity.ok(contactMessageRepository.save(contactMessage));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllMessages() {
        System.out.println("GET request received for all contact messages");
        try {
            var messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();
            System.out.println("Successfully fetched " + messages.size() + " messages");
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error fetching messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
