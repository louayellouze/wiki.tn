package api.tn.wiki.repository;

import api.tn.wiki.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long>, JpaSpecificationExecutor<RepairRequest> {
    List<RepairRequest> findAllByOrderByCreatedAtDesc();
    List<RepairRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<RepairRequest> findByEmailOrderByCreatedAtDesc(String email);
    List<RepairRequest> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<RepairRequest> findByPhoneOrderByCreatedAtDesc(String phone);
    List<RepairRequest> findByFirstNameIgnoreCaseAndLastNameIgnoreCaseOrderByCreatedAtDesc(String firstName, String lastName);
}
