package api.tn.wiki.entity;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "repair_items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RepairItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView({Views.Public.class, Views.Internal.class})
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    @JsonView(Views.Public.class)
    private RepairSection section;

    @Column(nullable = true)
    @JsonView(Views.Public.class)
    private String title;

    @JsonView(Views.Public.class)
    private String subtitle; 

    @Column(columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String imageUrl;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String logoUrl;

    @Column(name = "target_device")
    @JsonView(Views.Public.class)
    private String targetDevice;

    @Column(name = "icon_name")
    @JsonView(Views.Public.class)
    private String iconName; 

    @JsonView(Views.Public.class)
    private Double price;

    @Column(name = "order_index")
    @JsonView(Views.Public.class)
    private Integer orderIndex = 0;

    @JsonView(Views.Public.class)
    private boolean active = true;

    public RepairItem(RepairSection section, String title, String subtitle, String description, String imageUrl, String logoUrl, String iconName, Double price, Integer orderIndex, boolean active) {
        this.section = section;
        this.title = title;
        this.subtitle = subtitle;
        this.description = description;
        this.imageUrl = imageUrl;
        this.logoUrl = logoUrl;
        this.iconName = iconName;
        this.price = price;
        this.orderIndex = orderIndex;
        this.active = active;
    }
}
