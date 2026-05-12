package api.tn.wiki.repository;

import api.tn.wiki.entity.Product;
import api.tn.wiki.entity.ProductSubscription;
import api.tn.wiki.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSubscriptionRepository extends JpaRepository<ProductSubscription, Long> {
    List<ProductSubscription> findByProductAndNotifiedFalse(Product product);
    boolean existsByUserAndProductAndNotifiedFalse(User user, Product product);
}
