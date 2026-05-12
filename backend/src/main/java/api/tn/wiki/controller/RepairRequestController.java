package api.tn.wiki.controller;

import api.tn.wiki.entity.RepairRequest;
import api.tn.wiki.service.RepairRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.annotation.JsonView;
import api.tn.wiki.dto.Views;
import java.security.Principal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/repair-requests")
public class RepairRequestController {

    private final RepairRequestService service;
    private final api.tn.wiki.repository.UserRepository userRepository;

    public RepairRequestController(RepairRequestService service, api.tn.wiki.repository.UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    @JsonView(Views.Public.class)
    public ResponseEntity<List<RepairRequest>> getMyRequests(Principal principal) {
        String username = principal.getName();
        api.tn.wiki.entity.User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(service.getMyRequests(user.getEmail(), user.getPhone(), user.getFirstName(), user.getLastName()));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER') or hasRole('INFOLINE')")
    public ResponseEntity<Page<RepairRequest>> searchRequests(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        return ResponseEntity.ok(service.searchRequests(query, status, pageable));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER') or hasRole('INFOLINE')")
    public ResponseEntity<List<RepairRequest>> getAllRequests(@RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getRequestsByStatus(status));
        }
        return ResponseEntity.ok(service.getAllRequests());
    }

    @PostMapping
    @JsonView(Views.Public.class)
    public ResponseEntity<RepairRequest> createRequest(@RequestBody RepairRequest request) {
        return ResponseEntity.ok(service.saveRequest(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER') or hasRole('INFOLINE')")
    public ResponseEntity<RepairRequest> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        service.deleteRequest(id);
        return ResponseEntity.ok().build();
    }
}
