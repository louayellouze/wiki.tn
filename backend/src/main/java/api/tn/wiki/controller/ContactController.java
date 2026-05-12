package api.tn.wiki.controller;

import api.tn.wiki.dto.response.ContactResponse;
import api.tn.wiki.entity.ContactMessage;
import api.tn.wiki.entity.ContactStatus;
import api.tn.wiki.service.ContactService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contact")
@CrossOrigin
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<?> sendContactMessage(@RequestBody ContactMessage contactMessage) {
        try {
            return ResponseEntity.ok(contactService.sendContactMessage(contactMessage));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER', 'INFOLINE')")
    public ResponseEntity<Page<ContactResponse>> getAllMessages(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(contactService.getAllMessages(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ContactResponse>> getMyMessages() {
        return ResponseEntity.ok(contactService.getMyMessages());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER', 'INFOLINE')")
    public ResponseEntity<ContactResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        ContactStatus status = ContactStatus.valueOf((String) body.get("status"));
        String response = (String) body.get("response");
        return ResponseEntity.ok(contactService.updateStatus(id, status, response));
    }
}
