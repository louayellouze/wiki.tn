package api.tn.wiki.service;

import api.tn.wiki.dto.response.ContactResponse;
import api.tn.wiki.entity.ContactMessage;
import api.tn.wiki.entity.ContactStatus;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.ContactMessageRepository;
import api.tn.wiki.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final UserRepository userRepository;

    public ContactService(ContactMessageRepository contactMessageRepository, UserRepository userRepository) {
        this.contactMessageRepository = contactMessageRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.equals("anonymousUser")) return null;
        return userRepository.findByUsername(username).orElse(null);
    }

    public ContactResponse sendContactMessage(ContactMessage message) {
        User user = getCurrentUser();
        if (user != null) {
            message.setUser(user);
            // Ensure the email matches the account email for better tracking
            message.setEmail(user.getEmail());
        }
        message.setStatus(ContactStatus.PENDING);
        return mapToResponse(contactMessageRepository.save(message));
    }

    public Page<ContactResponse> getAllMessages(Pageable pageable) {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToResponse);
    }

    public List<ContactResponse> getMyMessages() {
        User user = getCurrentUser();
        if (user == null) throw new RuntimeException("User not authenticated");
        
        // Fetch by user link
        List<ContactMessage> byUser = contactMessageRepository.findByUserOrderByCreatedAtDesc(user);
        
        // Fetch by email (for messages sent while not logged in)
        List<ContactMessage> byEmail = contactMessageRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail());
        
        // Fetch by phone (if available)
        List<ContactMessage> byPhone = new java.util.ArrayList<>();
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            byPhone = contactMessageRepository.findByPhoneOrderByCreatedAtDesc(user.getPhone());
        }
        
        // Combine and de-duplicate by ID
        java.util.Map<Long, ContactMessage> combined = new java.util.LinkedHashMap<>();
        
        // Put user-linked first
        byUser.forEach(m -> combined.put(m.getId(), m));
        // Put email-linked
        byEmail.forEach(m -> combined.putIfAbsent(m.getId(), m));
        // Put phone-linked
        byPhone.forEach(m -> combined.putIfAbsent(m.getId(), m));
        
        return combined.values().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContactResponse updateStatus(Long id, ContactStatus status, String response) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setStatus(status);
        if (response != null) {
            message.setResponse(response);
        }
        return mapToResponse(contactMessageRepository.save(message));
    }

    private ContactResponse mapToResponse(ContactMessage message) {
        return new ContactResponse(
                message.getId(),
                message.getSubject(),
                message.getFirstName(),
                message.getLastName(),
                message.getEmail(),
                message.getPhone(),
                message.getMessage(),
                message.getResponse(),
                message.getStatus(),
                message.getCreatedAt()
        );
    }
}
