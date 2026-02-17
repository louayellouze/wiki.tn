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
}
