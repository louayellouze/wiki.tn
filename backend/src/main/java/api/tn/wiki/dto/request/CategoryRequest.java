package api.tn.wiki.dto.request;


public class CategoryRequest {
    private String name;
    private String description;
    private String imageUrl;
    private boolean isFeatured;
    private Long parentId;

    public CategoryRequest() {}

    public CategoryRequest(String name, String description, String imageUrl, boolean isFeatured, Long parentId) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isFeatured = isFeatured;
        this.parentId = parentId;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean isFeatured) { this.isFeatured = isFeatured; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
}
