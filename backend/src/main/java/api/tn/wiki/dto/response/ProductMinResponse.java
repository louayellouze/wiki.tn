package api.tn.wiki.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
public class ProductMinResponse {
    @JsonView(Views.Internal.class)
    private Integer id;
    private String title;
    private String slug;
    private Double regularPrice;
    private Double discountPrice;
    private String stockStatus;
    private String imageUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("isFlashSale")
    private boolean isFlashSale;
    private String reference;
    private String codeSage;
    private Integer quantity;
    private java.util.List<api.tn.wiki.dto.response.CategoryResponse> categories;

    public ProductMinResponse() {}

    public ProductMinResponse(Integer id, String title, String slug, Double regularPrice, Double discountPrice, String stockStatus, String imageUrl, boolean isFlashSale, String reference, String codeSage, Integer quantity, java.util.List<api.tn.wiki.dto.response.CategoryResponse> categories) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.regularPrice = regularPrice;
        this.discountPrice = discountPrice;
        this.stockStatus = stockStatus;
        this.imageUrl = imageUrl;
        this.isFlashSale = isFlashSale;
        this.reference = reference;
        this.codeSage = codeSage;
        this.quantity = quantity;
        this.categories = categories;
    }

    @JsonView(Views.Internal.class)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public Double getRegularPrice() { return regularPrice; }
    public void setRegularPrice(Double regularPrice) { this.regularPrice = regularPrice; }

    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @com.fasterxml.jackson.annotation.JsonProperty("isFlashSale")
    public boolean isFlashSale() { return isFlashSale; }

    @com.fasterxml.jackson.annotation.JsonProperty("isFlashSale")
    public void setFlashSale(boolean flashSale) { isFlashSale = flashSale; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getCodeSage() { return codeSage; }
    public void setCodeSage(String codeSage) { this.codeSage = codeSage; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public java.util.List<api.tn.wiki.dto.response.CategoryResponse> getCategories() { return categories; }
    public void setCategories(java.util.List<api.tn.wiki.dto.response.CategoryResponse> categories) { this.categories = categories; }

    public static ProductMinResponseBuilder builder() {
        return new ProductMinResponseBuilder();
    }

    public static class ProductMinResponseBuilder {
        private Integer id;
        private String title;
        private String slug;
        private Double regularPrice;
        private Double discountPrice;
        private String stockStatus;
        private String imageUrl;
        private boolean isFlashSale;
        private String reference;
        private String codeSage;
        private Integer quantity;
        private java.util.List<api.tn.wiki.dto.response.CategoryResponse> categories;

        public ProductMinResponseBuilder id(Integer id) { this.id = id; return this; }
        public ProductMinResponseBuilder title(String title) { this.title = title; return this; }
        public ProductMinResponseBuilder slug(String slug) { this.slug = slug; return this; }
        public ProductMinResponseBuilder regularPrice(Double regularPrice) { this.regularPrice = regularPrice; return this; }
        public ProductMinResponseBuilder discountPrice(Double discountPrice) { this.discountPrice = discountPrice; return this; }
        public ProductMinResponseBuilder stockStatus(String stockStatus) { this.stockStatus = stockStatus; return this; }
        public ProductMinResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ProductMinResponseBuilder isFlashSale(boolean isFlashSale) { this.isFlashSale = isFlashSale; return this; }
        public ProductMinResponseBuilder reference(String reference) { this.reference = reference; return this; }
        public ProductMinResponseBuilder codeSage(String codeSage) { this.codeSage = codeSage; return this; }
        public ProductMinResponseBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public ProductMinResponseBuilder categories(java.util.List<api.tn.wiki.dto.response.CategoryResponse> categories) { this.categories = categories; return this; }

        public ProductMinResponse build() {
            ProductMinResponse response = new ProductMinResponse(id, title, slug, regularPrice, discountPrice, stockStatus, imageUrl, isFlashSale, reference, codeSage, quantity, categories);
            response.setId(id);
            return response;
        }
    }
}
