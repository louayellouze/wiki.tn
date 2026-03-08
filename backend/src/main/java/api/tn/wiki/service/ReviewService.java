package api.tn.wiki.service;

import api.tn.wiki.dto.request.ReviewRequest;
import api.tn.wiki.dto.response.ReviewResponse;
import api.tn.wiki.entity.Product;
import api.tn.wiki.entity.Review;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.ProductRepository;
import api.tn.wiki.repository.ReviewRepository;
import api.tn.wiki.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, 
                         ProductRepository productRepository, 
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public ReviewResponse addReview(ReviewRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUser(user);
        review.setProduct(product);

        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProduct(Integer productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getUsername().equals(user.getUsername())) {
            throw new RuntimeException("Unauthorized: You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getUsername().equals(user.getUsername())) {
            throw new RuntimeException("Unauthorized: You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review review) {
        String fullName = review.getUser().getFirstName() + " " + review.getUser().getLastName();
        return new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUser().getUsername(),
                fullName.trim()
        );
    }
}
