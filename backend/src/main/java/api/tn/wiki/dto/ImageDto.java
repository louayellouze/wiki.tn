package api.tn.wiki.dto;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

public class ImageDto {
    @JsonView(Views.Internal.class)
    private Integer id;
    private String imageUrl;
    private String alt;

    public ImageDto() {
    }

    public ImageDto(Integer id, String imageUrl, String alt) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.alt = alt;
    }

    @JsonView(Views.Internal.class)
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAlt() {
        return alt;
    }

    public void setAlt(String alt) {
        this.alt = alt;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ImageDto imageDto = (ImageDto) o;
        return java.util.Objects.equals(imageUrl, imageDto.imageUrl) &&
               java.util.Objects.equals(alt, imageDto.alt);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(imageUrl, alt);
    }
}
