package api.tn.wiki.repository;

import api.tn.wiki.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    List<ContactMessage> findByUserOrderByCreatedAtDesc(api.tn.wiki.entity.User user);
    List<ContactMessage> findByEmailOrderByCreatedAtDesc(String email);
    List<ContactMessage> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<ContactMessage> findByPhoneOrderByCreatedAtDesc(String phone);
}
