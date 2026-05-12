package api.tn.wiki.dto.request;

import api.tn.wiki.entity.OrderStatus;
import java.util.List;

public class OrderRequest {
    private List<OrderItemRequest> items;
    private OrderStatus status; // Optional for updates
    private String address;
    private String postalCode;
    private String phone;
    private String username; // Optional: For Infoline to specify customer
    private api.tn.wiki.entity.PaymentMethod paymentMethod;
    private String couponCode;

    public OrderRequest() {}

    public OrderRequest(List<OrderItemRequest> items, OrderStatus status, String address, String postalCode) {
        this.items = items;
        this.status = status;
        this.address = address;
        this.postalCode = postalCode;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public api.tn.wiki.entity.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(api.tn.wiki.entity.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public static class OrderItemRequest {
        private Integer productId;
        private Integer quantity;

        public OrderItemRequest() {}

        public OrderItemRequest(Integer productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Integer getProductId() {
            return productId;
        }

        public void setProductId(Integer productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
