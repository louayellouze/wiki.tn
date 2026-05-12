package api.tn.wiki.dto.response;

import java.util.List;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
public class CategoryResponse {
    @JsonView(Views.Public.class)
    private Long id;
    @JsonView(Views.Public.class)
    private String name;
    @JsonView(Views.Public.class)
    private String slug;
    @JsonView(Views.Public.class)
    private String description;
    @JsonView(Views.Public.class)
    private String imageUrl;
    @JsonView(Views.Public.class)
    private boolean isFeatured;
    @JsonView(Views.Public.class)
    private Long parentId;
    @JsonView(Views.Public.class)
    private String parentName;
    @JsonView(Views.Public.class)
    private String parentSlug;
    @JsonView(Views.Public.class)
    private List<CategoryResponse> subCategories;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String slug, String description, String imageUrl, boolean isFeatured, Long parentId, String parentName, String parentSlug, List<CategoryResponse> subCategories) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isFeatured = isFeatured;
        this.parentId = parentId;
        this.parentName = parentName;
        this.parentSlug = parentSlug;
        this.subCategories = subCategories;
    }

    // Helper constructor for when subCategories is not needed (prevents recursion issues in simple lists)
    public CategoryResponse(Long id, String name, String slug, String description, String imageUrl, boolean isFeatured, Long parentId, String parentName, String parentSlug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isFeatured = isFeatured;
        this.parentId = parentId;
        this.parentName = parentName;
        this.parentSlug = parentSlug;
    }

    @JsonView(Views.Public.class)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonView(Views.Public.class)
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @JsonView(Views.Public.class)
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    @JsonView(Views.Public.class)
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @JsonView(Views.Public.class)
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @JsonView(Views.Public.class)
    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean isFeatured) { this.isFeatured = isFeatured; }

    @JsonView(Views.Public.class)
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    @JsonView(Views.Public.class)
    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    @JsonView(Views.Public.class)
    public String getParentSlug() { return parentSlug; }
    public void setParentSlug(String parentSlug) { this.parentSlug = parentSlug; }

    @JsonView(Views.Public.class)
    public List<CategoryResponse> getSubCategories() { return subCategories; }
    public void setSubCategories(List<CategoryResponse> subCategories) { this.subCategories = subCategories; }

    public static CategoryResponseBuilder builder() {
        return new CategoryResponseBuilder();
    }

    public static class CategoryResponseBuilder {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private String imageUrl;
        private boolean isFeatured;
        private Long parentId;
        private String parentName;
        private String parentSlug;
        private List<CategoryResponse> subCategories;

        public CategoryResponseBuilder id(Long id) { this.id = id; return this; }
        public CategoryResponseBuilder name(String name) { this.name = name; return this; }
        public CategoryResponseBuilder slug(String slug) { this.slug = slug; return this; }
        public CategoryResponseBuilder description(String description) { this.description = description; return this; }
        public CategoryResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CategoryResponseBuilder isFeatured(boolean isFeatured) { this.isFeatured = isFeatured; return this; }
        public CategoryResponseBuilder parentId(Long parentId) { this.parentId = parentId; return this; }
        public CategoryResponseBuilder parentName(String parentName) { this.parentName = parentName; return this; }
        public CategoryResponseBuilder parentSlug(String parentSlug) { this.parentSlug = parentSlug; return this; }
        public CategoryResponseBuilder subCategories(List<CategoryResponse> subCategories) { this.subCategories = subCategories; return this; }
        public CategoryResponse build() {
            return new CategoryResponse(id, name, slug, description, imageUrl, isFeatured, parentId, parentName, parentSlug, subCategories);
        }
    }
}
