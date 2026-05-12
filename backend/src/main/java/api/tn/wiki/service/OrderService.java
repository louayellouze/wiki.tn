package api.tn.wiki.service;

import api.tn.wiki.dto.request.OrderRequest;
import api.tn.wiki.dto.response.OrderResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.entity.PaymentMethod;
import api.tn.wiki.repository.CouponRepository;
import api.tn.wiki.repository.OrderRepository;
import api.tn.wiki.repository.ProductRepository;
import api.tn.wiki.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final CouponRepository couponRepository;
    private final StripeService stripeService;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        HistoriqueService historiqueService,
                        PasswordEncoder passwordEncoder,
                        NotificationService notificationService,
                        EmailService emailService,
                        CouponRepository couponRepository,
                        StripeService stripeService,
                        PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.historiqueService = historiqueService;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.couponRepository = couponRepository;
        this.stripeService = stripeService;
        this.paymentService = paymentService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToResponse);
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
                            User createdUser = userRepository.save(newUser);
                            emailService.sendWelcomeEmail(createdUser);
                            return createdUser;
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
        boolean hasSurCommande = false;

        if (request.getItems() != null) {
            for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                // Validate stock availability
                Integer currentStock = product.getQuantity() != null ? product.getQuantity() : 0;
                int requestedQty = itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 1;
                
                System.out.println("Processing Product ID: " + product.getId() + ", Current Stock: " + currentStock + ", Requested: " + requestedQty);

                // BLOCK: Only allow EN_STOCK and EN_COMMANDE
                if (product.getStockStatus() != StockStatus.EN_STOCK && product.getStockStatus() != StockStatus.EN_COMMANDE) {
                    String statusLabel = product.getStockStatus() == StockStatus.EN_ARRIVAGE ? "en arrivage" : "hors stock";
                    throw new RuntimeException("Le produit '" + product.getTitle() + "' est actuellement " + statusLabel + " et ne peut pas être commandé.");
                }

                if (product.getStockStatus() == StockStatus.EN_COMMANDE) {
                    hasSurCommande = true;
                } else {
                    // Only check stock if NOT EN_COMMANDE
                    if (currentStock < requestedQty) {
                        throw new RuntimeException("Stock insuffisant pour le produit '" + product.getTitle() + 
                                "'. Disponible: " + currentStock + ", Demandé: " + requestedQty);
                    }
                }

                // Deduct stock (allow negative if EN_COMMANDE if desired, but here we cap at 0 or just subtract)
                int newStock = Math.max(0, currentStock - requestedQty);
                product.setQuantity(newStock);
                
                // AUTO-STATUS: If quantity reaches 0, set status to HORS_STOCK (unless EN_COMMANDE)
                if (newStock <= 0 && product.getStockStatus() == StockStatus.EN_STOCK) {
                    product.setStockStatus(StockStatus.HORS_STOCK);
                }
                
                System.out.println("Updating Product ID: " + product.getId() + " to New Stock: " + newStock);
                productRepository.save(product);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                
                int qty = itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 1;
                orderItem.setQuantity(qty);
                
                Double price;
                if (product.getDiscountPrice() != null && product.getDiscountPrice() > 0) {
                    price = product.getDiscountPrice();
                } else {
                    price = product.getRegularPrice() != null ? product.getRegularPrice() : 0.0;
                }
                
                if (price == null) price = 0.0;
                orderItem.setPrice(price); 

                order.addItem(orderItem);
                totalAmount += price * qty;
            }
        }
        
        // Apply Coupon
        double discountAmount = 0;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Coupon invalide."));
            
            if (!coupon.getIsActive()) {
                throw new RuntimeException("Ce coupon n'est plus actif.");
            }
            if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Ce coupon est expiré.");
            }
            if (totalAmount < coupon.getMinOrderAmount()) {
                throw new RuntimeException("Le montant minimum pour ce coupon est de " + coupon.getMinOrderAmount() + " TND.");
            }

            if (coupon.getDiscountType() == Coupon.DiscountType.PERCENT) {
                discountAmount = totalAmount * (coupon.getDiscountValue() / 100.0);
            } else {
                discountAmount = coupon.getDiscountValue();
            }
            
            totalAmount = Math.max(0, totalAmount - discountAmount);
            order.setDiscountAmount(discountAmount);
            order.setCouponCode(request.getCouponCode());
        }

        // Handle Stripe Payment initialization BEFORE final save
        String checkoutUrl = null;
        if (order.getPaymentMethod() == PaymentMethod.STRIPE) {
            order.setStatus(OrderStatus.AWAITING_PAYMENT);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        if (order.getPaymentMethod() == PaymentMethod.STRIPE) {
            try {
                checkoutUrl = stripeService.createCheckoutSession(savedOrder);
                // Create a PENDING payment record so it shows up in the backoffice immediately
                paymentService.createPayment(savedOrder, null, "PENDING");
            } catch (Exception e) {
                System.err.println("CRITICAL: Stripe Session Creation Failed for Order #" + savedOrder.getId() + ": " + e.getMessage());
                // Provide a clearer error message for the client
                throw new RuntimeException("Échec de l'initialisation du paiement Stripe. " +
                        "La commande n'a pas été enregistrée. Veuillez réessayer ou choisir un autre mode de paiement. " +
                        "(Erreur: " + e.getMessage() + ")");
            }
        }

        // Log Historique
        historiqueService.logAction(
            ActionType.CREATE, 
            EntityType.ORDER, 
            "Commande créée par " + currentUser.getUsername() + " (Total: " + totalAmount + ")", 
            savedOrder.getId(), 
            currentUser
        );

        if (hasSurCommande) {
            notificationService.createNotification(
                "La commande #" + savedOrder.getId() + " de " + currentUser.getFirstName() + " a des produits SUR COMMANDE.",
                "ORDER_SUR_COMMANDE",
                savedOrder.getId()
            );
        }

        // Send Confirmation Email
        emailService.sendOrderConfirmationEmail(savedOrder);

        OrderResponse response = mapToResponse(savedOrder);
        response.setCheckoutUrl(checkoutUrl);
        response.setDiscountAmount(discountAmount);
        if (checkoutUrl != null) {
            response.setMessage("Redirection vers le paiement...");
        } else {
            response.setMessage("Commande enregistrée avec succès.");
        }
        
        return response;
    }

    @Transactional
    public void markOrderAsPaid(Long orderId, String transactionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.AWAITING_PAYMENT || order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.PAID);
            Order savedOrder = orderRepository.save(order);

            // Create or Update Payment record to SUCCESS
            paymentService.upsertPayment(savedOrder, transactionId, "SUCCESS");

            // Log Historique
            historiqueService.logAction(
                    ActionType.UPDATE,
                    EntityType.ORDER,
                    "Paiement Stripe confirmé (Transaction: " + transactionId + "). Statut: AWAITING_PAYMENT → PAID",
                    orderId,
                    null // System action via webhook
            );

            // Send confirmation email after payment
            emailService.sendPaymentConfirmationEmail(order);
        }
    }

    @Transactional
    public OrderResponse updateDeliveryTracking(Long id, Double lat, Double lng, String trackingNumber) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));

        if (lat != null) order.setDeliveryLatitude(lat);
        if (lng != null) order.setDeliveryLongitude(lng);
        if (trackingNumber != null) {
            if (order.getTrackingNumber() == null) {
                order.setShippedAt(LocalDateTime.now());
                if (order.getStatus() != OrderStatus.SHIPPED) {
                    order.setStatus(OrderStatus.SHIPPED);
                }
            }
            order.setTrackingNumber(trackingNumber);
        }

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        
        // AUTO-PAY: If status is DELIVERED, it must be marked as PAID in our financial records
        // Since payment happens upon delivery for non-Stripe methods
        if (status == OrderStatus.DELIVERED && oldStatus != OrderStatus.PAID) {
            paymentService.upsertPayment(order, "DELIVERY_PAYMENT_" + order.getId(), "SUCCESS");
        }

        Order savedOrder = orderRepository.save(order);

        // Log Historique
        User currentUser = getCurrentUser();
        historiqueService.logAction(
            ActionType.UPDATE, 
            EntityType.ORDER, 
            "Statut de la commande " + id + " modifié: " + oldStatus + " → " + status + 
            (status == OrderStatus.DELIVERED ? " (Paiement validé à la livraison)" : ""), 
            id, 
            currentUser
        );

        // Send Email Notification for specific statuses
        if (status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            emailService.sendOrderStatusEmail(savedOrder);
        }

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse trackOrder(Long id, String email) {
        System.out.println("🔍 Tentative de suivi de commande - ID: " + id + ", Email: " + email);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    System.err.println("❌ Commande #" + id + " non trouvée en base de données.");
                    return new RuntimeException("Commande non trouvée : #" + id);
                });
        
        System.out.println("✅ Commande trouvée. Email en base: " + order.getUser().getEmail());

        if (!order.getUser().getEmail().equalsIgnoreCase(email.trim())) {
            System.err.println("❌ L'email fourni (" + email + ") ne correspond pas à l'email de la commande (" + order.getUser().getEmail() + ")");
            throw new RuntimeException("L'adresse email ne correspond pas à cette commande.");
        }
        
        return mapToResponse(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        
        // Return stock to products before deleting
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    int currentQty = product.getQuantity() != null ? product.getQuantity() : 0;
                    int restoredQty = currentQty + item.getQuantity();
                    product.setQuantity(restoredQty);
                    
                    // AUTO-STATUS: If it was HORS_STOCK and we restore, set to EN_STOCK
                    if (restoredQty > 0 && product.getStockStatus() == StockStatus.HORS_STOCK) {
                        product.setStockStatus(StockStatus.EN_STOCK);
                    }
                    productRepository.save(product);
                }
            }
        }

        orderRepository.delete(order);

        // Log Historique
        User currentUser = getCurrentUser();
        historiqueService.logAction(
            ActionType.DELETE, 
            EntityType.ORDER, 
            "Commande " + id + " supprimée et stock restauré", 
            id, 
            currentUser
        );
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        
        // Security Check: Clients can only see their own orders
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.CLIENT && !order.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Accès refusé : vous ne pouvez consulter que vos propres commandes.");
        }
        
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

        OrderResponse response = new OrderResponse(
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
        response.setDiscountAmount(order.getDiscountAmount());
        response.setCouponCode(order.getCouponCode());
        response.setDeliveryLatitude(order.getDeliveryLatitude());
        response.setDeliveryLongitude(order.getDeliveryLongitude());
        response.setTrackingNumber(order.getTrackingNumber());
        response.setShippedAt(order.getShippedAt());
        return response;
    }
}
