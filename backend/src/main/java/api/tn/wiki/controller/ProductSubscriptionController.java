package api.tn.wiki.controller;

import api.tn.wiki.entity.Product;
import api.tn.wiki.entity.ProductSubscription;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.ProductRepository;
import api.tn.wiki.repository.ProductSubscriptionRepository;
import api.tn.wiki.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductSubscriptionController {

    private final ProductSubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductSubscriptionController(ProductSubscriptionRepository subscriptionRepository,
                                         ProductRepository productRepository,
                                         UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/{productId}/subscribe")
    public ResponseEntity<?> subscribeToProduct(@PathVariable Integer productId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (subscriptionRepository.existsByUserAndProductAndNotifiedFalse(user, product)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vous êtes déjà abonné à ce produit."));
        }

        ProductSubscription subscription = new ProductSubscription(user, product);
        subscriptionRepository.save(subscription);

        return ResponseEntity.ok(Map.of("message", "Vous serez notifié dès que ce produit sera de nouveau en stock."));
    }
}
