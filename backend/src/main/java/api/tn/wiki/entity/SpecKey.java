package api.tn.wiki.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spec_key")
public class SpecKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "specKey", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpecValue> specValues = new ArrayList<>();

    public SpecKey() {
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<SpecValue> getSpecValues() {
        return specValues;
    }

    public void setSpecValues(List<SpecValue> specValues) {
        this.specValues = specValues;
    }
}
