package api.tn.wiki.repository;

import api.tn.wiki.entity.RepairItem;
import api.tn.wiki.entity.RepairSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairItemRepository extends JpaRepository<RepairItem, Long>, JpaSpecificationExecutor<RepairItem> {
    List<RepairItem> findBySectionOrderByOrderIndexAsc(RepairSection section);
    List<RepairItem> findBySectionAndActiveTrueOrderByOrderIndexAsc(RepairSection section);
    List<RepairItem> findAllByOrderBySectionAscOrderIndexAsc();
    List<RepairItem> findAllByActiveTrueOrderBySectionAscOrderIndexAsc();
}
