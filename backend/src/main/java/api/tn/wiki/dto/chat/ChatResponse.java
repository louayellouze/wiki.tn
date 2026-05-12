package api.tn.wiki.dto.chat;

import java.util.List;

public class ChatResponse {
    private String content;
    private List<ProductRecommendation> recommendations;

    public ChatResponse() {
    }

    public ChatResponse(String content) {
        this.content = content;
    }

    public ChatResponse(String content, List<ProductRecommendation> recommendations) {
        this.content = content;
        this.recommendations = recommendations;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<ProductRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<ProductRecommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public static class ProductRecommendation {
        private Integer id;
        private String title;
        private String slug;
        private Double price;
        private String imageUrl;

        public ProductRecommendation() {
        }

        public ProductRecommendation(Integer id, String title, String slug, Double price, String imageUrl) {
            this.id = id;
            this.title = title;
            this.slug = slug;
            this.price = price;
            this.imageUrl = imageUrl;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getSlug() {
            return slug;
        }

        public void setSlug(String slug) {
            this.slug = slug;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}
