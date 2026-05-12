package api.tn.wiki.repository;

import api.tn.wiki.entity.RepairQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepairQuoteRepository extends JpaRepository<RepairQuote, Long> {
    Optional<RepairQuote> findByRepairRequestId(Long repairRequestId);
    boolean existsByRepairRequestId(Long repairRequestId);
}
