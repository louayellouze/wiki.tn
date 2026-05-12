package api.tn.wiki.controller;

import api.tn.wiki.dto.request.RepairQuoteRequest;
import api.tn.wiki.entity.RepairQuote;
import api.tn.wiki.service.RepairQuoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.annotation.JsonView;
import api.tn.wiki.dto.Views;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/repair-quotes")
public class RepairQuoteController {

    private final RepairQuoteService service;

    public RepairQuoteController(RepairQuoteService service) {
        this.service = service;
    }

    // Admin envoie un devis pour une demande de réparation
    @PostMapping("/request/{requestId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER') or hasRole('INFOLINE')")
    public ResponseEntity<RepairQuote> sendQuote(
            @PathVariable Long requestId,
            @RequestBody RepairQuoteRequest request) {
        return ResponseEntity.ok(service.sendQuote(requestId, request));
    }

    // Admin consulte le devis d'une demande
    @GetMapping("/request/{requestId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WEBMASTER') or hasRole('INFOLINE')")
    public ResponseEntity<RepairQuote> getQuoteByRequestId(@PathVariable Long requestId) {
        RepairQuote quote = service.getQuoteByRequestId(requestId);
        if (quote == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(quote);
    }

    // Client consulte son propre devis
    @GetMapping("/my/request/{requestId}")
    public ResponseEntity<RepairQuote> getMyQuoteByRequestId(@PathVariable Long requestId, java.security.Principal principal) {
        RepairQuote quote = service.getMyQuoteByRequestId(requestId, principal.getName());
        if (quote == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(quote);
    }

    // Client accepte ou refuse le devis (public — appelé depuis le lien dans l'email)
    @PatchMapping("/{id}/respond")
    public ResponseEntity<RepairQuote> respondToQuote(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.respondToQuote(id, body.get("response")));
    }

    // Client initialise le paiement
    @PostMapping("/{id}/pay")
    public ResponseEntity<Map<String, String>> initiatePayment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) throws Exception {
        String method = body.get("method");
        String result = service.initiatePayment(id, method);
        return ResponseEntity.ok(Map.of("result", result));
    }
}
