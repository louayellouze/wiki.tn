package api.tn.wiki.repository;

import api.tn.wiki.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    java.util.Optional<Payment> findFirstByOrderId(Long orderId);
    java.util.Optional<Payment> findFirstByOrderIdAndStatus(Long orderId, String status);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalPayments();
}
