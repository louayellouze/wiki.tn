package api.tn.wiki.dto;

public class SpecificationDto {
    private Integer id;
    private String keyName;
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
