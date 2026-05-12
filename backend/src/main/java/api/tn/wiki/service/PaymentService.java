package api.tn.wiki.service;

import api.tn.wiki.dto.response.PaymentResponse;
import api.tn.wiki.entity.Order;
import api.tn.wiki.entity.Payment;
import api.tn.wiki.entity.PaymentMethod;
import api.tn.wiki.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .username(payment.getOrder().getUser().getUsername())
                .paymentDate(payment.getPaymentDate())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .transactionId(payment.getTransactionId())
                .status(payment.getStatus())
                .build();
    }

    public Double getTotalPayments() {
        Double total = paymentRepository.getTotalPayments();
        return total != null ? total : 0.0;
    }

    @Transactional
    public Payment createPayment(Order order, String transactionId, String status) {
        Payment payment = new Payment(
                order,
                order.getTotalAmount(),
                order.getPaymentMethod(),
                transactionId,
                status
        );
        return paymentRepository.save(payment);
    }

    @Transactional
    public void updatePaymentStatus(Long orderId, String transactionId, String status) {
        paymentRepository.findFirstByOrderId(orderId).ifPresent(payment -> {
            payment.setStatus(status);
            if (transactionId != null) {
                payment.setTransactionId(transactionId);
            }
            paymentRepository.save(payment);
        });
    }

    @Transactional
    public void upsertPayment(Order order, String transactionId, String status) {
        paymentRepository.findFirstByOrderId(order.getId())
            .ifPresentOrElse(
                payment -> {
                    payment.setStatus(status);
                    if (transactionId != null) payment.setTransactionId(transactionId);
                    paymentRepository.save(payment);
                },
                () -> createPayment(order, transactionId, status)
            );
    }
}
