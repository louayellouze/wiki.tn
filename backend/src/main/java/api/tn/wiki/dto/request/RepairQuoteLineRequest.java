package api.tn.wiki.dto.request;

import lombok.Data;

@Data
public class RepairQuoteLineRequest {
    private Long repairItemId;  // optionnel — sélectionné depuis le catalogue
    private String description; // obligatoire si repairItemId est null
    private Integer quantity = 1;
    private Double unitPrice;   // obligatoire si repairItemId est null ou si on surcharge le prix du catalogue
}
