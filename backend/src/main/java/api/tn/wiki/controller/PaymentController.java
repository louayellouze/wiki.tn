package api.tn.wiki.controller;

import api.tn.wiki.dto.response.PaymentResponse;
import api.tn.wiki.entity.Payment;
import api.tn.wiki.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/total")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE')")
    public ResponseEntity<Map<String, Double>> getTotalPayments() {
        return ResponseEntity.ok(Map.of("total", paymentService.getTotalPayments()));
    }

    @PostMapping("/{orderId}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<Void> validatePayment(@PathVariable Long orderId) {
        paymentService.updatePaymentStatus(orderId, "MANUAL_VALIDATION", "SUCCESS");
        return ResponseEntity.ok().build();
    }
}
