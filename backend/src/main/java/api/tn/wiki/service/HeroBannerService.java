package api.tn.wiki.service;

import api.tn.wiki.entity.HeroBanner;
import api.tn.wiki.repository.HeroBannerRepository;
import api.tn.wiki.dto.response.HeroBannerResponse;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HeroBannerService {

    private final HeroBannerRepository heroBannerRepository;

    public HeroBannerService(HeroBannerRepository heroBannerRepository) {
        this.heroBannerRepository = heroBannerRepository;
    }

    public List<HeroBannerResponse> getActiveBanners() {
        return heroBannerRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HeroBannerResponse> getBannersByEmplacement(String emplacement) {
        return heroBannerRepository.findByEmplacementAndActiveTrueOrderByDisplayOrderAsc(emplacement)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<HeroBannerResponse> getAllBanners(Pageable pageable) {
        return heroBannerRepository.findAll(pageable).map(this::toResponse);
    }

    public List<HeroBannerResponse> getAllBanners() {
        return heroBannerRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public HeroBannerResponse createBanner(HeroBanner banner) {
        return toResponse(heroBannerRepository.save(banner));
    }

    public HeroBannerResponse updateBanner(Long id, HeroBanner updated) {
        HeroBanner existing = heroBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found: " + id));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setSecondaryImageUrl(updated.getSecondaryImageUrl());
        existing.setThirdImageUrl(updated.getThirdImageUrl());
        existing.setLinkUrl(updated.getLinkUrl());
        existing.setButtonText(updated.getButtonText());
        existing.setEmplacement(updated.getEmplacement());
        existing.setActive(updated.isActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        return toResponse(heroBannerRepository.save(existing));
    }

    public HeroBannerResponse toggleActive(Long id) {
        HeroBanner banner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found: " + id));
        banner.setActive(!banner.isActive());
        return toResponse(heroBannerRepository.save(banner));
    }

    public void deleteBanner(Long id) {
        heroBannerRepository.deleteById(id);
    }

    public HeroBannerResponse toResponse(HeroBanner entity) {
        return new HeroBannerResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getSecondaryImageUrl(),
                entity.getThirdImageUrl(),
                entity.getLinkUrl(),
                entity.getButtonText(),
                entity.getEmplacement(),
                entity.isActive(),
                entity.getDisplayOrder()
        );
    }
}
