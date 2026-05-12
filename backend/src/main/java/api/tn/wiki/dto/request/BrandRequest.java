package api.tn.wiki.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BrandRequest {
    private String name;
    private String description;
    @JsonProperty("logoUrl")
    private String logoUrl;

    public BrandRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
