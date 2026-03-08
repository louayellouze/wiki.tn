package api.tn.wiki.dto.response;

/**
 * Lightweight DTO for search autocomplete — no joins, fast projection.
 */
public class










ProductSearchDto {
    private Integer id;
    private String title;
    private Double regularPrice;
    private Double discountPrice;
    private String stockStatus;
    private String imageUrl;

    public ProductSearchDto() {}

    public ProductSearchDto(Integer id, String title, Double regularPrice, Double discountPrice, String stockStatus, String imageUrl) {
        this.id = id;
        this.title = title;
        this.regularPrice = regularPrice;
        this.discountPrice = discountPrice;
        this.stockStatus = stockStatus;
        this.imageUrl = imageUrl;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getRegularPrice() { return regularPrice; }
    public void setRegularPrice(Double regularPrice) { this.regularPrice = regularPrice; }

    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
