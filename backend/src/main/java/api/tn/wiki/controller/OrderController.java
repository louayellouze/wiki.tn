package api.tn.wiki.controller;

import api.tn.wiki.dto.request.OrderRequest;
import api.tn.wiki.dto.response.OrderResponse;
import api.tn.wiki.entity.OrderStatus;
import api.tn.wiki.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE')")
    public ResponseEntity<?> getAllOrders(
            @PageableDefault(size = 10, sort = "orderDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_INFOLINE', 'ROLE_ADMIN', 'ROLE_WEBMASTER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/public/track")
    public ResponseEntity<?> trackOrder(@RequestParam Long id, @RequestParam String email) {
        try {
            return ResponseEntity.ok(orderService.trackOrder(id, email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_INFOLINE')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            return ResponseEntity.ok(orderService.createOrder(request));
        } catch (RuntimeException e) {
            System.err.println("❌ Order Validation Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Throwable e) {
            System.err.println("❌ CRITICAL ORDER ERROR:");
            e.printStackTrace();
            String detail = e.getMessage() != null ? e.getMessage() : e.getClass().getName();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Critical Server Error during order placement",
                "message", detail,
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE', 'ROLE_CLIENT')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        // TODO: For CLIENT/INFOLINE, we should check if they own the order or have permission
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE', 'ROLE_CLIENT')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PatchMapping("/{id}/delivery")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE')")
    public ResponseEntity<OrderResponse> updateDeliveryTracking(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String trackingNumber) {
        return ResponseEntity.ok(orderService.updateDeliveryTracking(id, lat, lng, trackingNumber));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE', 'ROLE_CLIENT')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
