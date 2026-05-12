package api.tn.wiki.controller;

import api.tn.wiki.dto.Views;
import api.tn.wiki.entity.RepairItem;
import api.tn.wiki.entity.RepairSection;
import api.tn.wiki.service.RepairItemService;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/repair-items")
public class RepairItemController {

    private final RepairItemService service;

    public RepairItemController(RepairItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RepairItem>> getAllItems(
            @RequestParam(required = false) RepairSection section,
            @RequestParam(defaultValue = "true") boolean onlyActive) {
        if (section != null) {
            return ResponseEntity.ok(service.getItemsBySection(section, onlyActive));
        }
        return ResponseEntity.ok(service.getAllItems(onlyActive));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER')")
    public ResponseEntity<Page<RepairItem>> searchItems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) RepairSection section,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderIndex,asc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        return ResponseEntity.ok(service.searchItems(query, section, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER')")
    public ResponseEntity<RepairItem> createItem(@RequestBody RepairItem item) {
        return ResponseEntity.ok(service.saveItem(item));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER')")
    public ResponseEntity<RepairItem> updateItem(@PathVariable Long id, @RequestBody RepairItem item) {
        return ResponseEntity.ok(service.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        service.deleteItem(id);
        return ResponseEntity.ok().build();
    }
}
