package api.tn.wiki.repository;

import api.tn.wiki.entity.SpecKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecKeyRepository extends JpaRepository<SpecKey, Integer> {
    Optional<SpecKey> findByName(String name);
    boolean existsByName(String name);

    @Query("SELECT DISTINCT sk FROM SpecKey sk " +
           "JOIN sk.specValues sv " +
           "JOIN sv.product p " +
           "JOIN p.categories c " +
           "WHERE c.id IN :categoryIds")
    List<SpecKey> findSpecKeysByCategoryIds(@Param("categoryIds") List<Long> categoryIds);

    @Query(value = "SELECT DISTINCT sk.* FROM spec_key sk " +
           "JOIN spec_value sv ON sk.id = sv.spec_key_id " +
           "JOIN product p ON sv.product_id = p.id " +
           "WHERE p.search_vector @@ websearch_to_tsquery('french', :query) " +
           "OR p.title ILIKE CONCAT('%', :query, '%') " +
           "OR p.reference ILIKE CONCAT('%', :query, '%')", 
           nativeQuery = true)
    List<SpecKey> searchSpecKeys(@Param("query") String query);
}
