package api.tn.wiki.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RepairQuoteRequest {
    private String adminNote;
    private List<RepairQuoteLineRequest> lines;
}
