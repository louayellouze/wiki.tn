package api.tn.wiki.repository;

import api.tn.wiki.entity.SpecValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecValueRepository extends JpaRepository<SpecValue, Integer> {
    List<SpecValue> findByProductId(Integer productId);
    List<SpecValue> findBySpecKeyId(Integer specKeyId);
    void deleteByProductId(Integer productId);

    @Query("SELECT DISTINCT sv.value FROM SpecValue sv " +
           "JOIN sv.product p " +
           "JOIN p.categories c " +
           "WHERE sv.specKey.id = :keyId AND c.id IN :categoryIds")
    List<String> findDistinctValuesBySpecKeyAndCategoryIds(@Param("keyId") Integer keyId, @Param("categoryIds") List<Long> categoryIds);

    @Query("SELECT sk.id, sv.value FROM SpecValue sv " +
           "JOIN sv.specKey sk " +
           "JOIN sv.product p " +
           "JOIN p.categories c " +
           "WHERE c.id IN :categoryIds")
    List<Object[]> findRawSpecsByCategoryIds(@Param("categoryIds") List<Long> categoryIds);

    @Query(value = "SELECT DISTINCT sk.id, sv.value FROM spec_value sv " +
           "JOIN spec_key sk ON sv.spec_key_id = sk.id " +
           "JOIN product p ON sv.product_id = p.id " +
           "WHERE p.search_vector @@ websearch_to_tsquery('french', :query) " +
           "OR p.title ILIKE CONCAT('%', :query, '%') " +
           "OR p.reference ILIKE CONCAT('%', :query, '%')", 
           nativeQuery = true)
    List<Object[]> findRawSpecsBySearch(@Param("query") String query);

    @Query(value = "SELECT DISTINCT sv.value FROM spec_value sv " +
           "JOIN product p ON sv.product_id = p.id " +
           "WHERE sv.spec_key_id = :keyId AND (" +
           "p.search_vector @@ websearch_to_tsquery('french', :query) " +
           "OR p.title ILIKE CONCAT('%', :query, '%') " +
           "OR p.reference ILIKE CONCAT('%', :query, '%'))", 
           nativeQuery = true)
    List<String> searchDistinctValuesBySpecKey(@Param("keyId") Integer keyId, @Param("query") String query);
    @Query("SELECT sk.id, sv.value FROM SpecValue sv " +
           "JOIN sv.specKey sk")
    List<Object[]> findRawSpecsAll();
}
