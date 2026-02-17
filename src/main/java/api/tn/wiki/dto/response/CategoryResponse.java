package api.tn.wiki.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long parentId;
    private String parentName;
    private List<CategoryResponse> subCategories;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String description, String imageUrl, Long parentId, String parentName, List<CategoryResponse> subCategories) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.parentId = parentId;
        this.parentName = parentName;
        this.subCategories = subCategories;
    }

    // Helper constructor for when subCategories is not needed (prevents recursion issues in simple lists)
    public CategoryResponse(Long id, String name, String description, String imageUrl, Long parentId, String parentName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.parentId = parentId;
        this.parentName = parentName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public List<CategoryResponse> getSubCategories() { return subCategories; }
    public void setSubCategories(List<CategoryResponse> subCategories) { this.subCategories = subCategories; }

    public static CategoryResponseBuilder builder() {
        return new CategoryResponseBuilder();
    }

    public static class CategoryResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private String imageUrl;
        private Long parentId;
        private String parentName;
        private List<CategoryResponse> subCategories;

        public CategoryResponseBuilder id(Long id) { this.id = id; return this; }
        public CategoryResponseBuilder name(String name) { this.name = name; return this; }
        public CategoryResponseBuilder description(String description) { this.description = description; return this; }
        public CategoryResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CategoryResponseBuilder parentId(Long parentId) { this.parentId = parentId; return this; }
        public CategoryResponseBuilder parentName(String parentName) { this.parentName = parentName; return this; }
        public CategoryResponseBuilder subCategories(List<CategoryResponse> subCategories) { this.subCategories = subCategories; return this; }
        public CategoryResponse build() {
            return new CategoryResponse(id, name, description, imageUrl, parentId, parentName, subCategories);
        }
    }
}
