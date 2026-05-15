package api.tn.wiki.entity;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "repair_requests", indexes = {
    @Index(name = "idx_repair_user_id", columnList = "user_id"),
    @Index(name = "idx_repair_status", columnList = "status"),
    @Index(name = "idx_repair_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RepairRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(Views.Public.class)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonView(Views.Public.class)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String firstName;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String lastName;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String email;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String phone;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String subject;

    @Column(columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String message;

    @JsonView(Views.Public.class)
    private String deviceType;
    
    @JsonView(Views.Public.class)
    private String brand;
    
    @JsonView(Views.Public.class)
    private String model;
    
    @JsonView(Views.Public.class)
    private String serialNumber;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String photoUrl;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    @CreationTimestamp
    @JsonView(Views.Public.class)
    private LocalDateTime createdAt;
}
