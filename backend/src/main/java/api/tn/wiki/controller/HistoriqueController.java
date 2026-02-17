package api.tn.wiki.controller;

import api.tn.wiki.dto.request.HistoriqueFilterRequest;
import api.tn.wiki.dto.response.HistoriqueResponse;
import api.tn.wiki.service.HistoriqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historique")
@CrossOrigin(origins = "*")
public class HistoriqueController {

    private final HistoriqueService historiqueService;

    public HistoriqueController(HistoriqueService historiqueService) {
        this.historiqueService = historiqueService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<HistoriqueResponse>> getAllHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<HistoriqueResponse> history = historiqueService.getAllHistory(page, size);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<HistoriqueResponse>> searchHistory(
            @RequestBody HistoriqueFilterRequest filterRequest
    ) {
        Page<HistoriqueResponse> history = historiqueService.getHistory(filterRequest);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HistoriqueResponse>> getRecentHistory() {
        List<HistoriqueResponse> recentHistory = historiqueService.getRecentHistory();
        return ResponseEntity.ok(recentHistory);
    }
}
