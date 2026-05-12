package api.tn.wiki.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
public class CategoryMinResponse {
    @JsonView(Views.Internal.class)
    private Long id;
    private String name;
    private String slug;
    private String imageUrl;
    private Long parentId;
    private boolean isFeatured;

    public CategoryMinResponse() {}

    public CategoryMinResponse(Long id, String name, String slug, String imageUrl, Long parentId, boolean isFeatured) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.imageUrl = imageUrl;
        this.parentId = parentId;
        this.isFeatured = isFeatured;
    }

    @JsonView(Views.Internal.class)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }

    public static CategoryMinResponseBuilder builder() {
        return new CategoryMinResponseBuilder();
    }

    public static class CategoryMinResponseBuilder {
        private Long id;
        private String name;
        private String slug;
        private String imageUrl;
        private Long parentId;
        private boolean isFeatured;

        public CategoryMinResponseBuilder id(Long id) { this.id = id; return this; }
        public CategoryMinResponseBuilder name(String name) { this.name = name; return this; }
        public CategoryMinResponseBuilder slug(String slug) { this.slug = slug; return this; }
        public CategoryMinResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CategoryMinResponseBuilder parentId(Long parentId) { this.parentId = parentId; return this; }
        public CategoryMinResponseBuilder isFeatured(boolean isFeatured) { this.isFeatured = isFeatured; return this; }

        public CategoryMinResponse build() {
            return new CategoryMinResponse(id, name, slug, imageUrl, parentId, isFeatured);
        }
    }
}
