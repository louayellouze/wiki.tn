package api.tn.wiki.controller;

import api.tn.wiki.dto.response.SpecKeyResponse;
import api.tn.wiki.service.SpecKeyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/spec-keys")
public class SpecKeyController {

    private final SpecKeyService specKeyService;

    public SpecKeyController(SpecKeyService specKeyService) {
        this.specKeyService = specKeyService;
    }

    @GetMapping
    public ResponseEntity<List<SpecKeyResponse>> getAllSpecKeys() {
        try {
            List<SpecKeyResponse> specKeys = specKeyService.getAllSpecKeys();
            return ResponseEntity.ok(specKeys);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createSpecKey(@RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body("Access Denied: Admin role required");
        }

        try {
            String name = request.get("name");
            String type = request.get("type");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }

            SpecKeyResponse specKey = specKeyService.createSpecKey(name, type);
            return ResponseEntity.ok(specKey);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating spec key: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSpecKey(@PathVariable Integer id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body("Access Denied: Admin role required");
        }

        try {
            specKeyService.deleteSpecKey(id);
            return ResponseEntity.ok("SpecKey deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting spec key: " + e.getMessage());
        }
    }

    private boolean isAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }
}
