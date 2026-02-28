package api.tn.wiki.controller;

import api.tn.wiki.dto.response.SpecKeyResponse;
import api.tn.wiki.service.SpecKeyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/spec-keys")
@CrossOrigin(origins = "*")
public class SpecKeyController {

    private static final Logger logger = LoggerFactory.getLogger(SpecKeyController.class);
    private final SpecKeyService specKeyService;

    public SpecKeyController(SpecKeyService specKeyService) {
        this.specKeyService = specKeyService;
    }

    @GetMapping
    public ResponseEntity<List<SpecKeyResponse>> getAllSpecKeys() {
        try {
            logger.info("Fetching all spec keys");
            List<SpecKeyResponse> specKeys = specKeyService.getAllSpecKeys();
            logger.info("Found {} spec keys", specKeys.size());
            return ResponseEntity.ok(specKeys);
        } catch (Exception e) {
            logger.error("Error fetching all spec keys", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSpecKey(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }

            SpecKeyResponse specKey = specKeyService.createSpecKey(name);
            return ResponseEntity.ok(specKey);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating spec key", e);
            return ResponseEntity.status(500).body("Error creating spec key: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSpecKey(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }

            SpecKeyResponse specKey = specKeyService.updateSpecKey(id, name);
            return ResponseEntity.ok(specKey);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating spec key", e);
            return ResponseEntity.status(500).body("Error updating spec key: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/values")
    public ResponseEntity<List<String>> getUniqueValuesForKey(
            @PathVariable Integer id,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String q) {
        try {
            logger.info("Fetching values for spec key id: {}, categoryId: {}, query: {}", id, categoryId, q);
            List<String> values = specKeyService.getUniqueValuesForKey(id, categoryId, q);
            logger.info("Found {} values", values.size());
            return ResponseEntity.ok(values);
        } catch (Exception e) {
            logger.error("Error fetching values for spec key {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SpecKeyResponse>> getSpecKeysByCategory(@PathVariable Long categoryId) {
        try {
            logger.info("Fetching spec keys for category id: {}", categoryId);
            List<SpecKeyResponse> specKeys = specKeyService.getSpecKeysByCategory(categoryId);
            logger.info("Found {} spec keys for category {}", specKeys.size(), categoryId);
            return ResponseEntity.ok(specKeys);
        } catch (Exception e) {
            logger.error("Error fetching spec keys for category {}", categoryId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<SpecKeyResponse>> getSpecKeysBySearch(@RequestParam String q) {
        try {
            logger.info("Fetching spec keys for search query: {}", q);
            List<SpecKeyResponse> specKeys = specKeyService.getSpecKeysBySearch(q);
            logger.info("Found {} spec keys for search query: {}", specKeys.size(), q);
            return ResponseEntity.ok(specKeys);
        } catch (Exception e) {
            logger.error("Error fetching spec keys for search query {}", q, e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSpecKey(@PathVariable Integer id) {
        try {
            specKeyService.deleteSpecKey(id);
            return ResponseEntity.ok("SpecKey deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting spec key", e);
            return ResponseEntity.status(500).body("Error deleting spec key: " + e.getMessage());
        }
    }
}
