package api.tn.wiki.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Integer id;
    private String title;
    private String description;
    private Double regularPrice;
    private Double discountPrice;
    private Integer quantity;
    private String codeSage;
    private String reference;
    private String stockStatus;
    private List<ImageDto> images;
    private List<SpecificationDto> specifications;
}
