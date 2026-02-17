package api.tn.wiki.dto.request;

import api.tn.wiki.dto.ImageDto;
import api.tn.wiki.dto.SpecificationDto;

import java.util.ArrayList;
import java.util.List;

public class ProductRequest {
    private String title;
    private String description;
    private Double regularPrice;
    private Integer quantity;
    private List<Long> categoryIds = new ArrayList<>();

    public List<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }
    private String codeSage;
    private String reference;
    private Double discountPrice;
    private String stockStatus;
    private List<ImageDto> images = new ArrayList<>();
    private List<SpecificationDto> specifications = new ArrayList<>();

    public ProductRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
}
