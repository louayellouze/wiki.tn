package api.tn.wiki.service;

import api.tn.wiki.entity.RepairItem;
import api.tn.wiki.entity.RepairSection;
import api.tn.wiki.repository.RepairItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RepairItemService {

    private final RepairItemRepository repository;

    public RepairItemService(RepairItemRepository repository) {
        this.repository = repository;
    }

    public List<RepairItem> getAllItems(boolean onlyActive) {
        if (onlyActive) {
            return repository.findAllByActiveTrueOrderBySectionAscOrderIndexAsc();
        }
        return repository.findAllByOrderBySectionAscOrderIndexAsc();
    }

    public Page<RepairItem> searchItems(String query, RepairSection section, Pageable pageable) {
        Specification<RepairItem> spec = (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (section != null) {
                predicates.add(cb.equal(root.get("section"), section));
            }

            if (query != null && !query.isEmpty()) {
                String likeQuery = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), likeQuery),
                    cb.like(cb.lower(root.get("description")), likeQuery),
                    cb.like(cb.lower(root.get("subtitle")), likeQuery)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, pageable);
    }

    public List<RepairItem> getItemsBySection(RepairSection section, boolean onlyActive) {
        if (onlyActive) {
            return repository.findBySectionAndActiveTrueOrderByOrderIndexAsc(section);
        }
        return repository.findBySectionOrderByOrderIndexAsc(section);
    }

    public RepairItem saveItem(RepairItem item) {
        return repository.save(item);
    }

    public Optional<RepairItem> getItemById(Long id) {
        return repository.findById(id);
    }

    public void deleteItem(Long id) {
        repository.deleteById(id);
    }

    public RepairItem updateItem(Long id, RepairItem itemDetails) {
        RepairItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RepairItem not found with id: " + id));

        item.setTitle(itemDetails.getTitle());
        item.setSubtitle(itemDetails.getSubtitle());
        item.setDescription(itemDetails.getDescription());
        item.setImageUrl(itemDetails.getImageUrl());
        item.setLogoUrl(itemDetails.getLogoUrl());
        item.setTargetDevice(itemDetails.getTargetDevice());
        item.setIconName(itemDetails.getIconName());
        item.setPrice(itemDetails.getPrice());
        item.setSection(itemDetails.getSection());
        item.setOrderIndex(itemDetails.getOrderIndex());
        item.setActive(itemDetails.isActive());

        return repository.save(item);
    }
}
