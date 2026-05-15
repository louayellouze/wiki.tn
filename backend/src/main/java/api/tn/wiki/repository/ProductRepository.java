package api.tn.wiki.repository;

import api.tn.wiki.entity.Product;
import api.tn.wiki.entity.StockStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"brand", "images", "categories"})
    Page<Product> findAll(org.springframework.data.domain.Pageable pageable);

    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Product> findByStockStatus(StockStatus stockStatus);
    List<Product> findByTitleContainingIgnoreCase(String title);
    List<Product> findByTitleContainingIgnoreCaseOrBrand_NameContainingIgnoreCase(String title, String brandName);
    List<Product> findByQuantityLessThanEqual(Integer quantity);

    List<Product> findByCategories_Id(Long categoryId);
    @EntityGraph(attributePaths = {"brand", "images"})
    List<Product> findDistinctByCategories_IdIn(List<Long> categoryIds);
    @EntityGraph(attributePaths = {"brand", "images"})
    Page<Product> findDistinctByCategories_IdIn(List<Long> categoryIds, org.springframework.data.domain.Pageable pageable);
    
    @EntityGraph(attributePaths = {"brand", "images"})
    List<Product> findByIsFlashSaleTrueOrderByIdDesc();
    @EntityGraph(attributePaths = {"brand", "images"})
    Page<Product> findByIsFlashSaleTrue(org.springframework.data.domain.Pageable pageable);

    /**
     * Full search (used by /products page with all filters).
     * Uses 'simple' dictionary so technical brand names like ASUS, HP, SSD are preserved as-is.
     */
    @Query(value =
        "SELECT p.* FROM product p " +
        "LEFT JOIN brand b ON p.brand_id = b.id " +
        "WHERE (" +
        "  (p.search_vector @@ to_tsquery('simple', :queryPrefix)) " +
        "  OR (p.title ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (p.reference ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (p.description ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%')) " +
        "  OR EXISTS (SELECT 1 FROM spec_value sv WHERE sv.product_id = p.id AND sv.value ILIKE ('%' || :queryRaw || '%')) " +
        "  OR EXISTS (SELECT 1 FROM product_categories pc JOIN category c ON pc.category_id = c.id WHERE pc.product_id = p.id AND c.name ILIKE ('%' || :queryRaw || '%')) " +
        ") " +
        "AND (:stockStatus IS NULL OR p.stock_status = :stockStatus) " +
        "AND (:categoryIds IS NULL OR EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id IN :categoryIds)) " +
        "AND (:isFlashSale IS NULL OR p.is_flash_sale = :isFlashSale) " +
        "ORDER BY (" +
        "  COALESCE(ts_rank(p.search_vector, to_tsquery('simple', :queryPrefix)), 0) * 5 + " +
        "  (CASE WHEN p.title ILIKE ('%' || :queryRaw || '%') THEN 10 ELSE 0 END) + " +
        "  (CASE WHEN b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%') THEN 15 ELSE 0 END) " +
        ") DESC, p.title ASC",
        nativeQuery = true)
    List<Product> searchProducts(
        @Param("queryPrefix") String queryPrefix, 
        @Param("queryRaw") String queryRaw,
        @Param("stockStatus") String stockStatus,
        @Param("categoryIds") List<Long> categoryIds,
        @Param("isFlashSale") Boolean isFlashSale
    );

    @Query(value =
        "SELECT p.* FROM product p " +
        "LEFT JOIN brand b ON p.brand_id = b.id " +
        "WHERE (" +
        "  (p.search_vector @@ to_tsquery('simple', :queryPrefix)) " +
        "  OR (p.title ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (p.reference ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (p.description ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%')) " +
        "  OR EXISTS (SELECT 1 FROM spec_value sv WHERE sv.product_id = p.id AND sv.value ILIKE ('%' || :queryRaw || '%')) " +
        "  OR EXISTS (SELECT 1 FROM product_categories pc JOIN category c ON pc.category_id = c.id WHERE pc.product_id = p.id AND c.name ILIKE ('%' || :queryRaw || '%')) " +
        ") " +
        "ORDER BY (" +
        "  COALESCE(ts_rank(p.search_vector, to_tsquery('simple', :queryPrefix)), 0) * 5 + " +
        "  (CASE WHEN p.title ILIKE ('%' || :queryRaw || '%') THEN 10 ELSE 0 END) + " +
        "  (CASE WHEN b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%') THEN 15 ELSE 0 END) " +
        ") DESC, p.title ASC " +
        "LIMIT 10",
        nativeQuery = true)
    List<Product> searchProductsSimple(
        @Param("queryPrefix") String queryPrefix, 
        @Param("queryRaw") String queryRaw
    );

    @Query(value =
        "SELECT p.* FROM product p " +
        "LEFT JOIN brand b ON p.brand_id = b.id " +
        "WHERE (" +
        "  (p.search_vector @@ to_tsquery('simple', :queryPrefix)) " +
        "  OR (p.title ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (p.reference ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (p.description ILIKE ('%' || :queryRaw || '%')) " +
        "  OR (b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%')) " +
        "  OR EXISTS (SELECT 1 FROM spec_value sv WHERE sv.product_id = p.id AND sv.value ILIKE ('%' || :queryRaw || '%')) " +
        "  OR EXISTS (SELECT 1 FROM product_categories pc JOIN category c ON pc.category_id = c.id WHERE pc.product_id = p.id AND c.name ILIKE ('%' || :queryRaw || '%')) " +
        ") " +
        "AND (:stockStatus IS NULL OR p.stock_status = :stockStatus) " +
        "AND (:categoryIds IS NULL OR EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id IN :categoryIds)) " +
        "AND (:isFlashSale IS NULL OR p.is_flash_sale = :isFlashSale) " +
        "ORDER BY (" +
        "  COALESCE(ts_rank(p.search_vector, to_tsquery('simple', :queryPrefix)), 0) * 5 + " +
        "  (CASE WHEN p.title ILIKE ('%' || :queryRaw || '%') THEN 10 ELSE 0 END) + " +
        "  (CASE WHEN b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%') THEN 15 ELSE 0 END) " +
        ") DESC, p.title ASC",
        countQuery = "SELECT count(p.id) FROM product p " +
                     "LEFT JOIN brand b ON p.brand_id = b.id " +
                     "WHERE (" +
                     "  (p.search_vector @@ to_tsquery('simple', :queryPrefix)) " +
                     "  OR (p.title ILIKE ('%' || :queryRaw || '%')) " +
                     "  OR (p.reference ILIKE ('%' || :queryRaw || '%')) " +
                     "  OR (p.description ILIKE ('%' || :queryRaw || '%')) " +
                     "  OR (b.name IS NOT NULL AND b.name ILIKE ('%' || :queryRaw || '%')) " +
                     "  OR EXISTS (SELECT 1 FROM spec_value sv WHERE sv.product_id = p.id AND sv.value ILIKE ('%' || :queryRaw || '%')) " +
                     "  OR EXISTS (SELECT 1 FROM product_categories pc JOIN category c ON pc.category_id = c.id WHERE pc.product_id = p.id AND c.name ILIKE ('%' || :queryRaw || '%')) " +
                     ") " +
                     "AND (:stockStatus IS NULL OR p.stock_status = :stockStatus) " +
                     "AND (:categoryIds IS NULL OR EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id IN :categoryIds)) " +
                     "AND (:isFlashSale IS NULL OR p.is_flash_sale = :isFlashSale)",
        nativeQuery = true)
    Page<Product> searchProducts(
        @Param("queryPrefix") String queryPrefix, 
        @Param("queryRaw") String queryRaw, 
        @Param("stockStatus") String stockStatus,
        @Param("categoryIds") List<Long> categoryIds,
        @Param("isFlashSale") Boolean isFlashSale,
        org.springframework.data.domain.Pageable pageable
    );

    /**
     * Fast autocomplete — prefix match via to_tsquery('simple', 'asu:*').
     */
    @Query(value =
        "SELECT p.id, p.title, p.regular_price, p.discount_price, p.stock_status, p.slug, " +
        "  (SELECT img.image_url FROM image img WHERE img.product_id = p.id ORDER BY img.id ASC LIMIT 1) AS image_url, " +
        "  b.name AS brand_name " +
        "FROM product p " +
        "LEFT JOIN brand b ON p.brand_id = b.id " +
        "WHERE (" +
        "  to_tsvector('simple', p.title) @@ to_tsquery('simple', :queryPrefix) " +
        "  OR to_tsvector('simple', p.reference) @@ to_tsquery('simple', :queryPrefix) " +
        "  OR (b.name IS NOT NULL AND to_tsvector('simple', b.name) @@ to_tsquery('simple', :queryPrefix)) " +
        "  OR EXISTS (SELECT 1 FROM product_categories pc JOIN category c ON pc.category_id = c.id WHERE pc.product_id = p.id AND to_tsvector('simple', c.name) @@ to_tsquery('simple', :queryPrefix)) " +
        "  OR LOWER(p.title) LIKE LOWER(CONCAT('%', :queryRaw, '%')) " +
        ") " +
        "ORDER BY p.title ASC " +
        "LIMIT 10",
        nativeQuery = true)
    List<Object[]> searchProductsAutocomplete(
        @Param("queryPrefix") String queryPrefix,
        @Param("queryRaw") String queryRaw
    );
}
