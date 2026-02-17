package api.tn.wiki.repository;

import api.tn.wiki.entity.SpecValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecValueRepository extends JpaRepository<SpecValue, Integer> {
    List<SpecValue> findByProductId(Integer productId);
    List<SpecValue> findBySpecKeyId(Integer specKeyId);
    void deleteByProductId(Integer productId);
}
