package api.tn.wiki.dto;

import api.tn.wiki.dto.Views;
import com.fasterxml.jackson.annotation.JsonView;

public class SpecificationDto {
    @JsonView(Views.Internal.class)
    private Integer id;
    private String keyName;
    @JsonView(Views.Internal.class)
    private Integer keyId;
    private String value;

    public SpecificationDto() {
    }

    public SpecificationDto(Integer id, String keyName, Integer keyId, String value) {
        this.id = id;
        this.keyName = keyName;
        this.keyId = keyId;
        this.value = value;
    }

    @JsonView(Views.Internal.class)
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    @JsonView(Views.Internal.class)
    public Integer getKeyId() {
        return keyId;
    }

    public void setKeyId(Integer keyId) {
        this.keyId = keyId;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SpecificationDto that = (SpecificationDto) o;
        return java.util.Objects.equals(keyId, that.keyId) &&
               java.util.Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(keyId, value);
    }
}
