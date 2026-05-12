package api.tn.wiki.dto.response;

import api.tn.wiki.dto.ImageDto;
import api.tn.wiki.dto.SpecificationDto;

import java.util.ArrayList;
import java.util.List;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
public class ProductResponse {
    private Integer id;
    private String title;
    private String slug;
    private String description;
    private Double regularPrice;
    private Integer quantity;
    private List<CategoryResponse> categories = new ArrayList<>();
    private String codeSage;
    private String reference;
    private Double discountPrice;
    private String stockStatus;
    private String imageUrl; // First image URL for quick display
    private List<ImageDto> images = new ArrayList<>();
    private List<SpecificationDto> specifications = new ArrayList<>();
    private Double averageRating;
    private List<ReviewResponse> reviews = new ArrayList<>();
    private BrandResponse brand;
    @com.fasterxml.jackson.annotation.JsonProperty("isFlashSale")
    private boolean isFlashSale;

    public ProductResponse() {
    }

    public ProductResponse(Integer id, String title, String slug, String description, Double regularPrice,
                           Integer quantity, List<CategoryResponse> categories, String codeSage, String reference, 
                           Double discountPrice, String stockStatus, String imageUrl,
                           List<ImageDto> images, List<SpecificationDto> specifications,
                           Double averageRating, List<ReviewResponse> reviews) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.regularPrice = regularPrice;
        this.quantity = quantity;
        this.categories = categories;
        this.codeSage = codeSage;
        this.reference = reference;
        this.discountPrice = discountPrice;
        this.stockStatus = stockStatus;
        this.imageUrl = imageUrl;
        this.images = images;
        this.specifications = specifications;
        this.averageRating = averageRating;
        this.reviews = reviews;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getRegularPrice() {
        return regularPrice;
    }

    public void setRegularPrice(Double regularPrice) {
        this.regularPrice = regularPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public List<CategoryResponse> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryResponse> categories) {
        this.categories = categories;
    }

    public String getCodeSage() {
        return codeSage;
    }

    public void setCodeSage(String codeSage) {
        this.codeSage = codeSage;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Double getDiscountPrice() {
        return discountPrice;
    }

    public void setDiscountPrice(Double discountPrice) {
        this.discountPrice = discountPrice;
    }

    public List<ImageDto> getImages() {
        return images;
    }

    public void setImages(List<ImageDto> images) {
        this.images = images;
    }

    public List<SpecificationDto> getSpecifications() {
        return specifications;
    }

    public void setSpecifications(List<SpecificationDto> specifications) {
        this.specifications = specifications;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public List<ReviewResponse> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewResponse> reviews) {
        this.reviews = reviews;
    }

    public BrandResponse getBrand() {
        return brand;
    }

    public void setBrand(BrandResponse brand) {
        this.brand = brand;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isFlashSale")
    public boolean isFlashSale() {
        return isFlashSale;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isFlashSale")
    public void setFlashSale(boolean flashSale) {
        isFlashSale = flashSale;
    }
}
