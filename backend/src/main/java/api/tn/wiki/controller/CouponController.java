package api.tn.wiki.controller;

import api.tn.wiki.entity.Coupon;
import api.tn.wiki.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons().stream()
            .filter(c -> c.getIsActive() && (c.getExpiryDate() == null || c.getExpiryDate().isAfter(java.time.LocalDateTime.now())))
            .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER', 'INFOLINE')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.updateCoupon(id, coupon));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code, @RequestParam Double amount) {
        try {
            return ResponseEntity.ok(couponService.validateCoupon(code, amount));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/win")
    public ResponseEntity<?> winCoupon(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "L'email est requis"));
        }

        Coupon coupon = couponService.getRandomActiveCoupon();
        if (coupon == null) {
            return ResponseEntity.ok(Map.of("message", "Désolé, aucun coupon disponible pour le moment"));
        }

        couponService.sendCouponWinEmail(email, coupon);
        
        return ResponseEntity.ok(Map.of(
            "code", coupon.getCode(),
            "discountValue", coupon.getDiscountValue(),
            "discountType", coupon.getDiscountType(),
            "expiryDate", coupon.getExpiryDate() != null ? coupon.getExpiryDate() : "N/A"
        ));
    }
}
