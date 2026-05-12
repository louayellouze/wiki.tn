package api.tn.wiki.dto.response;

import java.io.Serializable;
import java.util.List;

public class SpecFilterResponse implements Serializable {
    private Integer id;
    private String name;
    private List<String> values;

    public SpecFilterResponse() {
    }

    public SpecFilterResponse(Integer id, String name, List<String> values) {
        this.id = id;
        this.name = name;
        this.values = values;
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

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }
}
