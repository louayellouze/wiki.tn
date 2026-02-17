package api.tn.wiki.controller;

import api.tn.wiki.dto.request.OrderRequest;
import api.tn.wiki.dto.response.OrderResponse;
import api.tn.wiki.entity.OrderStatus;
import api.tn.wiki.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER', 'INFOLINE')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CLIENT', 'INFOLINE', 'ADMIN', 'WEBMASTER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'INFOLINE')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            return ResponseEntity.ok(orderService.createOrder(request));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Critical Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER', 'INFOLINE', 'CLIENT')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        // TODO: For CLIENT/INFOLINE, we should check if they own the order or have permission
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CLIENT', 'INFOLINE')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'INFOLINE')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
