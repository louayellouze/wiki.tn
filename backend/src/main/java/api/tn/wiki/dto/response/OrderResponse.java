package api.tn.wiki.dto.response;

import api.tn.wiki.entity.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;

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
    private api.tn.wiki.entity.PaymentMethod paymentMethod;
    private List<OrderItemResponse> items;

    public OrderResponse() {}

    public OrderResponse(Long id, Integer userId, String username, LocalDateTime orderDate, 
                         OrderStatus status, Double totalAmount, String address, String postalCode, 
                         String phone, api.tn.wiki.entity.PaymentMethod paymentMethod, List<OrderItemResponse> items) {
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
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    public api.tn.wiki.entity.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(api.tn.wiki.entity.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public static class OrderItemResponse {
        private Long id;
        private Integer productId;
        private String productTitle;
        private Integer quantity;
        private Double price; // Changed from Float to Double based on Service usage
        private String productImageUrl;

        public OrderItemResponse() {}

        public OrderItemResponse(Long id, Integer productId, String productTitle, Integer quantity, Double price, String productImageUrl) {
            this.id = id;
            this.productId = productId;
            this.productTitle = productTitle;
            this.quantity = quantity;
            this.price = price;
            this.productImageUrl = productImageUrl;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }

        public String getProductTitle() { return productTitle; }
        public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public String getProductImageUrl() { return productImageUrl; }
        public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
    }
}
