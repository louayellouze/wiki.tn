package api.tn.wiki.service;

import api.tn.wiki.dto.request.OrderRequest;
import api.tn.wiki.dto.response.OrderResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.entity.PaymentMethod;
import api.tn.wiki.repository.OrderRepository;
import api.tn.wiki.repository.ProductRepository;
import api.tn.wiki.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final HistoriqueService historiqueService;
    private final PasswordEncoder passwordEncoder;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        HistoriqueService historiqueService,
                        PasswordEncoder passwordEncoder) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.historiqueService = historiqueService;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getMyOrders() {
        return orderRepository.findByUserOrderByOrderDateDesc(getCurrentUser()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User currentUser = getCurrentUser();
        Order order = new Order();
        order.setAddress(request.getAddress());
        order.setPostalCode(request.getPostalCode());
        order.setPhone(request.getPhone());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH_ON_DELIVERY);

        // Handle User Assignment (for Infoline/Admin)
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            boolean canAssign = currentUser.getRole() == Role.ADMIN || 
                                currentUser.getRole() == Role.WEBMASTER || 
                                currentUser.getRole() == Role.INFOLINE;
            
            if (canAssign) {
                String targetUsername = request.getUsername();
                User targetUser = userRepository.findByUsername(targetUsername)
                        .orElseGet(() -> {
                            // Auto-create user if not found
                            User newUser = new User();
                            newUser.setUsername(targetUsername);
                            newUser.setEmail(targetUsername + "@wiki.tn"); // Placeholder email
                            newUser.setPassword(passwordEncoder.encode(targetUsername)); // Password = username
                            newUser.setFirstName(targetUsername);
                            newUser.setLastName("Client");
                            newUser.setAddress(request.getAddress());
                            newUser.setRole(Role.CLIENT);
                            return userRepository.save(newUser);
                        });
                order.setUser(targetUser);
            } else {
                 // If not authorized, fallback to current user or throw error? 
                 // For safety, let's strictly enforce current user if they try to hack it.
                 order.setUser(currentUser);
            }
        } else {
            order.setUser(currentUser);
        }

        double totalAmount = 0;

        if (request.getItems() != null) {
            for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                // Validate stock availability
                Integer currentStock = product.getQuantity() != null ? product.getQuantity() : 0;
                System.out.println("Processing Product ID: " + product.getId() + ", Current Stock: " + currentStock + ", Requested: " + itemRequest.getQuantity());

                // BLOCK: Only allow EN_STOCK and EN_COMMANDE
                if (product.getStockStatus() != StockStatus.EN_STOCK && product.getStockStatus() != StockStatus.EN_COMMANDE) {
                    String statusLabel = product.getStockStatus() == StockStatus.EN_ARRIVAGE ? "en arrivage" : "hors stock";
                    throw new RuntimeException("Le produit '" + product.getTitle() + "' est actuellement " + statusLabel + " et ne peut pas être commandé.");
                }

                if (currentStock < itemRequest.getQuantity()) {
                    throw new RuntimeException("Stock insuffisant pour le produit '" + product.getTitle() + 
                            "'. Disponible: " + currentStock + ", Demandé: " + itemRequest.getQuantity());
                }

                // Deduct stock
                int newStock = currentStock - itemRequest.getQuantity();
                product.setQuantity(newStock);
                
                // AUTO-STATUS: If quantity reaches 0, set status to HORS_STOCK
                if (newStock == 0) {
                    product.setStockStatus(StockStatus.HORS_STOCK);
                }
                
                System.out.println("Updating Product ID: " + product.getId() + " to New Stock: " + newStock);
                productRepository.save(product);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemRequest.getQuantity());
                
                Double price;
                if (product.getDiscountPrice() != null && product.getDiscountPrice() > 0) {
                    price = product.getDiscountPrice();
                } else {
                    price = product.getRegularPrice() != null ? product.getRegularPrice() : 0.0;
                }
                orderItem.setPrice(price); 

                order.addItem(orderItem);
                totalAmount += orderItem.getPrice() * orderItem.getQuantity();
            }
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Log Historique
        historiqueService.logAction(
            ActionType.CREATE, 
            EntityType.ORDER, 
            "Commande créée par " + currentUser.getUsername() + " (Total: " + totalAmount + ")", 
            savedOrder.getId(), 
            currentUser
        );

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);

        // Log Historique
        User currentUser = getCurrentUser();
        historiqueService.logAction(
            ActionType.UPDATE, 
            EntityType.ORDER, 
            "Statut de la commande " + id + " modifié: " + oldStatus + " → " + status, 
            id, 
            currentUser
        );

        return mapToResponse(savedOrder);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        
        orderRepository.delete(order);

        // Log Historique
        User currentUser = getCurrentUser();
        historiqueService.logAction(
            ActionType.DELETE, 
            EntityType.ORDER, 
            "Commande " + id + " supprimée", 
            id, 
            currentUser
        );
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> {
                    String imageUrl = item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()
                            ? item.getProduct().getImages().get(0).getImageUrl()
                            : null;
                    return new OrderResponse.OrderItemResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getTitle(),
                            item.getQuantity(),
                            item.getPrice(),
                            imageUrl
                    );
                })
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getUsername(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getAddress(),
                order.getPostalCode(),
                order.getPhone(),
                order.getPaymentMethod(),
                itemResponses
        );
    }
}
