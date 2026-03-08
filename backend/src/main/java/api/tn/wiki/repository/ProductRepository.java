package api.tn.wiki.repository;

import api.tn.wiki.entity.Product;
import api.tn.wiki.entity.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByStockStatus(StockStatus stockStatus);
    List<Product> findByTitleContainingIgnoreCase(String title);

    List<Product> findByCategories_Id(Long categoryId);
    List<Product> findByCategories_IdIn(List<Long> categoryIds);

    /**
     * Full search (used by /products page with all filters).
     * Uses 'simple' dictionary so technical brand names like ASUS, HP, SSD are preserved as-is.
     */
    @Query(value =
        "SELECT * FROM product " +
        "WHERE (" +
        "  search_vector @@ to_tsquery('simple', :queryPrefix) " +
        "  OR similarity(title, :queryRaw) > 0.1 " +
        "  OR similarity(reference, :queryRaw) > 0.1 " +
        "  OR title ILIKE '%' || :queryRaw || '%' " +
        "  OR reference ILIKE '%' || :queryRaw || '%' " +
        ") " +
        "ORDER BY (" +
        "  ts_rank(search_vector, to_tsquery('simple', :queryPrefix)) * 2 + " +
        "  similarity(title, :queryRaw) * 5 + " +
        "  similarity(reference, :queryRaw) * 2 " +
        ") DESC, title ASC",
        nativeQuery = true)
    List<Product> searchProducts(@Param("queryPrefix") String queryPrefix, @Param("queryRaw") String queryRaw);

    /**
     * Fast autocomplete — prefix match via to_tsquery('simple', 'asu:*').
     */
    @Query(value =
        "SELECT p.id, p.title, p.regular_price, p.discount_price, p.stock_status, " +
        "  (SELECT img.image_url FROM image img WHERE img.product_id = p.id ORDER BY img.id ASC LIMIT 1) AS image_url " +
        "FROM product p " +
        "WHERE (" +
        "  p.search_vector @@ to_tsquery('simple', :queryPrefix) " +
        "  OR similarity(p.title, :queryRaw) > 0.1 " +
        "  OR similarity(p.reference, :queryRaw) > 0.1 " +
        "  OR p.title ILIKE '%' || :queryRaw || '%' " +
        ") " +
        "ORDER BY " +
        "  GREATEST(ts_rank(p.search_vector, to_tsquery('simple', :queryPrefix)), similarity(p.title, :queryRaw)) DESC, " +
        "  p.title ASC " +
        "LIMIT 10",
        nativeQuery = true)
    List<Object[]> searchProductsAutocomplete(
        @Param("queryPrefix") String queryPrefix,
        @Param("queryRaw") String queryRaw
    );
}
