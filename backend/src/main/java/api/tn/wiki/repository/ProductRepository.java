package api.tn.wiki.repository;

import api.tn.wiki.entity.Product;
import api.tn.wiki.entity.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByStockStatus(StockStatus stockStatus);
    List<Product> findByTitleContainingIgnoreCase(String title);

    List<Product> findByCategories_Id(Long categoryId);
    List<Product> findByCategories_IdIn(List<Long> categoryIds);
    @org.springframework.data.jpa.repository.Query(value = 
        "SELECT * FROM product " +
        "WHERE search_vector @@ websearch_to_tsquery('french', :query) " +
        "OR title ILIKE CONCAT('%', :query, '%') " +
        "OR reference ILIKE CONCAT('%', :query, '%') " +
        "ORDER BY ts_rank(search_vector, websearch_to_tsquery('french', :query)) DESC, title ASC", 
        nativeQuery = true)
    List<Product> searchProducts(@org.springframework.data.repository.query.Param("query") String query);
}
