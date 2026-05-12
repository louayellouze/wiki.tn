package api.tn.wiki.entity;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "repair_quote_lines")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RepairQuoteLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(Views.Public.class)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quote_id", nullable = false)
    @JsonIgnore
    private RepairQuote quote;

    @ManyToOne
    @JoinColumn(name = "repair_item_id")
    @JsonView(Views.Public.class)
    private RepairItem repairItem; 

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private String description;

    @JsonView(Views.Public.class)
    private Integer quantity = 1;

    @Column(nullable = false)
    @JsonView(Views.Public.class)
    private Double unitPrice;

    @JsonView(Views.Public.class)
    private Double totalPrice; 
}
