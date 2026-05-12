package api.tn.wiki.dto.response;

public class SpecKeyResponse {
    private Integer id;
    private String name;

    public SpecKeyResponse() {
    }

    public SpecKeyResponse(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
