package api.tn.wiki.entity;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "repair_quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RepairQuote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(Views.Public.class)
    private Long id;

    @OneToOne
    @JoinColumn(name = "repair_request_id", nullable = false)
    @JsonIgnoreProperties("quote")
    @JsonView(Views.Public.class)
    private RepairRequest repairRequest;

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonView(Views.Public.class)
    private List<RepairQuoteLine> lines = new ArrayList<>();

    @JsonView(Views.Public.class)
    private Double totalPrice;

    @Column(columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String adminNote;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String status = "SENT"; // SENT, ACCEPTED, REJECTED

    @CreationTimestamp
    @JsonView(Views.Public.class)
    private LocalDateTime createdAt;

    @JsonView(Views.Public.class)
    private LocalDateTime respondedAt;

    @JsonView(Views.Public.class)
    private String paymentMethod; 
    
    @JsonView(Views.Public.class)
    private String paymentStatus = "UNPAID"; 
    
    @JsonView(Views.Public.class)
    private String stripeSessionId;
}
