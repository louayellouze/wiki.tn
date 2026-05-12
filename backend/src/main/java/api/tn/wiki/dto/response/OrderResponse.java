package api.tn.wiki.dto.response;

import api.tn.wiki.entity.OrderStatus;
import api.tn.wiki.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Integer userId;
    private String username;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private Double totalAmount;
    private String address;
    private String postalCode;
    private String phone;
    private PaymentMethod paymentMethod;
    private List<OrderItemResponse> items;
    
    // Stripe & Coupon specific fields
    private String checkoutUrl;
    private Double discountAmount;
    private String couponCode;
    private String message;

    // Delivery Tracking
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private String trackingNumber;
    private LocalDateTime shippedAt;

    // Manual constructor for existing OrderService usage
    public OrderResponse(Long id, Integer userId, String username, LocalDateTime orderDate, 
                         OrderStatus status, Double totalAmount, String address, String postalCode, 
                         String phone, PaymentMethod paymentMethod, List<OrderItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.orderDate = orderDate;
        this.status = status;
        this.totalAmount = totalAmount;
        this.address = address;
        this.postalCode = postalCode;
        this.phone = phone;
        this.paymentMethod = paymentMethod;
        this.items = items;
        // discountAmount, couponCode, and delivery fields will be set later if applicable
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Integer productId;
        private String productTitle;
        private Integer quantity;
        private Double price;
        private String imageUrl;
    }
}
