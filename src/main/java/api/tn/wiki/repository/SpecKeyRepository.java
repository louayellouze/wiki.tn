package api.tn.wiki.repository;

import api.tn.wiki.entity.SpecKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecKeyRepository extends JpaRepository<SpecKey, Integer> {
    Optional<SpecKey> findByName(String name);
    boolean existsByName(String name);
}
