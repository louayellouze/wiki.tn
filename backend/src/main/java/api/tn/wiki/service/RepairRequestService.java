package api.tn.wiki.service;

import api.tn.wiki.entity.RepairRequest;
import api.tn.wiki.repository.RepairRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RepairRequestService {

    private final RepairRequestRepository repository;
    private final api.tn.wiki.repository.UserRepository userRepository;
    private final EmailService emailService;

    public RepairRequestService(RepairRequestRepository repository, api.tn.wiki.repository.UserRepository userRepository, EmailService emailService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public List<RepairRequest> getAllRequests() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<RepairRequest> getRequestsByEmail(String email) {
        return repository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    public List<RepairRequest> getMyRequests(String email, String phone, String firstName, String lastName) {
        List<RepairRequest> byEmail = repository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email);
        List<RepairRequest> byPhone = new ArrayList<>();
        if (phone != null && !phone.isEmpty()) {
            byPhone = repository.findByPhoneOrderByCreatedAtDesc(phone);
        }
        
        List<RepairRequest> byName = new ArrayList<>();
        if (firstName != null && lastName != null) {
            byName = repository.findByFirstNameIgnoreCaseAndLastNameIgnoreCaseOrderByCreatedAtDesc(firstName, lastName);
        }

        java.util.Map<Long, RepairRequest> combined = new java.util.LinkedHashMap<>();
        byEmail.forEach(r -> combined.put(r.getId(), r));
        byPhone.forEach(r -> combined.putIfAbsent(r.getId(), r));
        byName.forEach(r -> combined.putIfAbsent(r.getId(), r));

        return combined.values().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }

    public Page<RepairRequest> searchRequests(String query, String status, Pageable pageable) {
        Specification<RepairRequest> spec = (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (query != null && !query.isEmpty()) {
                String likeQuery = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("firstName")), likeQuery),
                    cb.like(cb.lower(root.get("lastName")), likeQuery),
                    cb.like(cb.lower(root.get("email")), likeQuery),
                    cb.like(cb.lower(root.get("phone")), likeQuery),
                    cb.like(cb.lower(root.get("deviceType")), likeQuery),
                    cb.like(cb.lower(root.get("brand")), likeQuery),
                    cb.like(cb.lower(root.get("model")), likeQuery)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, pageable);
    }

    public List<RepairRequest> getRequestsByStatus(String status) {
        return repository.findByStatusOrderByCreatedAtDesc(status);
    }

    private api.tn.wiki.entity.User getCurrentUser() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.equals("anonymousUser")) return null;
        return userRepository.findByUsername(username).orElse(null);
    }

    public RepairRequest saveRequest(RepairRequest request) {
        api.tn.wiki.entity.User user = getCurrentUser();
        if (user != null) {
            request.setUser(user);
            request.setEmail(user.getEmail()); // Ensure consistency
        }
        return repository.save(request);
    }

    public Optional<RepairRequest> getRequestById(Long id) {
        return repository.findById(id);
    }

    public void deleteRequest(Long id) {
        repository.deleteById(id);
    }

    public RepairRequest updateStatus(Long id, String status) {
        RepairRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RepairRequest not found with id: " + id));
        request.setStatus(status);
        RepairRequest updated = repository.save(request);
        
        // Envoi automatique de l'email de mise à jour
        emailService.sendRepairStatusUpdateEmail(updated);
        
        return updated;
    }
}
