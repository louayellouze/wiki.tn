package api.tn.wiki.repository;

import api.tn.wiki.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Integer productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(Integer productId);
    Page<Review> findByProductId(Integer productId, Pageable pageable);
    List<Review> findByUserOrderByCreatedAtDesc(api.tn.wiki.entity.User user);
    
    long countAllBySentimentIsNull();
    long countAllBySentimentScore(Double score);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r WHERE r.sentiment IS NULL OR r.sentimentScore = 0.5")
    List<Review> findAllToAnalyze();
}
