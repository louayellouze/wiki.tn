package api.tn.wiki.repository;

import api.tn.wiki.entity.Review;
import api.tn.wiki.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.product WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<Review> findByProductIdOrderByCreatedAtDesc(@Param("productId") Integer productId);

    @EntityGraph(attributePaths = {"user", "product"})
    List<Review> findByProductId(Integer productId);

    @EntityGraph(attributePaths = {"user", "product"})
    Page<Review> findByProductId(Integer productId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "product"})
    List<Review> findByUserOrderByCreatedAtDesc(User user);

    @EntityGraph(attributePaths = {"user", "product"})
    Page<Review> findAll(Pageable pageable);

    long countAllBySentimentIsNull();
    long countAllBySentimentScore(Double score);

    @Query("SELECT r FROM Review r WHERE r.sentiment IS NULL OR r.sentimentScore = 0.5")
    List<Review> findAllToAnalyze();
}
