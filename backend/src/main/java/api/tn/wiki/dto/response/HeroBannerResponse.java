package api.tn.wiki.dto.response;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HeroBannerResponse {
    @JsonView(Views.Internal.class)
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String secondaryImageUrl;
    private String thirdImageUrl;
    private String linkUrl;
    private String buttonText;
    private String emplacement;
    private boolean active;
    private Integer displayOrder;
}
