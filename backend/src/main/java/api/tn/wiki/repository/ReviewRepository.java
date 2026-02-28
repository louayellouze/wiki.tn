package api.tn.wiki.repository;

import api.tn.wiki.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Integer productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(Integer productId);
}
