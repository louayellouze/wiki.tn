package api.tn.wiki.dto.response;

import api.tn.wiki.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String username;
    private LocalDateTime paymentDate;
    private Double amount;
    private PaymentMethod method;
    private String transactionId;
    private String status;
}
