package api.tn.wiki.repository;

import api.tn.wiki.entity.ActionType;
import api.tn.wiki.entity.EntityType;
import api.tn.wiki.entity.Historique;
import api.tn.wiki.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Long>, JpaSpecificationExecutor<Historique> {

    Page<Historique> findAllByOrderByActionDateDesc(Pageable pageable);

    Page<Historique> findByUserOrderByActionDateDesc(User user, Pageable pageable);

    Page<Historique> findByActionTypeOrderByActionDateDesc(ActionType actionType, Pageable pageable);

    Page<Historique> findByEntityTypeOrderByActionDateDesc(EntityType entityType, Pageable pageable);

    Page<Historique> findByActionDateBetweenOrderByActionDateDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate, 
            Pageable pageable
    );

    List<Historique> findTop10ByOrderByActionDateDesc();
}
