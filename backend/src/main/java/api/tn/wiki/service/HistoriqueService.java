package api.tn.wiki.service;

import api.tn.wiki.dto.request.HistoriqueFilterRequest;
import api.tn.wiki.dto.response.HistoriqueResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.HistoriqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

@Service
public class HistoriqueService {

    private final HistoriqueRepository historiqueRepository;

    public HistoriqueService(HistoriqueRepository historiqueRepository) {
        this.historiqueRepository = historiqueRepository;
    }

    @Transactional
    public void logAction(ActionType actionType, EntityType entityType, String details, Long entityId, User user) {
        Historique historique = new Historique(actionType, entityType, details, entityId, user);
        historiqueRepository.save(historique);
    }

    public Page<HistoriqueResponse> getHistory(HistoriqueFilterRequest filterRequest) {
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize());
        
        Specification<Historique> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (filterRequest.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), filterRequest.getUserId()));
            }
            
            if (filterRequest.getActionType() != null) {
                predicates.add(cb.equal(root.get("actionType"), filterRequest.getActionType()));
            }
            
            if (filterRequest.getEntityType() != null) {
                predicates.add(cb.equal(root.get("entityType"), filterRequest.getEntityType()));
            }
            
            if (filterRequest.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("actionDate"), filterRequest.getStartDate()));
            }
            
            if (filterRequest.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("actionDate"), filterRequest.getEndDate()));
            }
            
            query.orderBy(cb.desc(root.get("actionDate")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Historique> historiquePage = historiqueRepository.findAll(spec, pageable);

        return historiquePage.map(this::convertToResponse);
    }

    public Page<HistoriqueResponse> getAllHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Historique> historiquePage = historiqueRepository.findAllByOrderByActionDateDesc(pageable);
        return historiquePage.map(this::convertToResponse);
    }

    public List<HistoriqueResponse> getRecentHistory() {
        List<Historique> recentHistory = historiqueRepository.findTop10ByOrderByActionDateDesc();
        return recentHistory.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private HistoriqueResponse convertToResponse(Historique historique) {
        User user = historique.getUser();

        // @NotFound(IGNORE) renvoie null si l'utilisateur a été supprimé
        Integer userId  = user != null ? user.getId()       : null;
        String username = user != null ? user.getUsername()  : "système";
        String fullName = user != null ? user.getFirstName() + " " + user.getLastName() : "Utilisateur supprimé";
        Role   role     = user != null ? user.getRole()      : null;

        return new HistoriqueResponse(
            historique.getId(),
            historique.getActionType(),
            historique.getEntityType(),
            historique.getDetails(),
            historique.getEntityId(),
            historique.getActionDate(),
            userId,
            username,
            fullName,
            role
        );
    }
}
