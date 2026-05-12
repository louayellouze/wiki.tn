package api.tn.wiki.dto;

/**
 * Jackson JSON Views to control data visibility between Storefront and Backoffice.
 */
public class Views {
    
    /**
     * View for public storefront. Hides internal database IDs.
     */
    public interface Public {}

    /**
     * View for administrative backoffice. Includes everything from Public plus internal IDs.
     */
    public interface Internal extends Public {}
}
