package api.tn.wiki.service;

import api.tn.wiki.entity.HeroBanner;
import api.tn.wiki.repository.HeroBannerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HeroBannerService {

    private final HeroBannerRepository heroBannerRepository;

    public HeroBannerService(HeroBannerRepository heroBannerRepository) {
        this.heroBannerRepository = heroBannerRepository;
    }

    public List<HeroBanner> getActiveBanners() {
        return heroBannerRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public List<HeroBanner> getBannersByEmplacement(String emplacement) {
        return heroBannerRepository.findByEmplacementAndActiveTrueOrderByDisplayOrderAsc(emplacement);
    }

    public List<HeroBanner> getAllBanners() {
        return heroBannerRepository.findAll();
    }

    public HeroBanner createBanner(HeroBanner banner) {
        return heroBannerRepository.save(banner);
    }

    public HeroBanner updateBanner(Long id, HeroBanner updated) {
        HeroBanner existing = heroBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found: " + id));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setLinkUrl(updated.getLinkUrl());
        existing.setButtonText(updated.getButtonText());
        existing.setEmplacement(updated.getEmplacement());
        existing.setActive(updated.isActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        return heroBannerRepository.save(existing);
    }

    public HeroBanner toggleActive(Long id) {
        HeroBanner banner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found: " + id));
        banner.setActive(!banner.isActive());
        return heroBannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        heroBannerRepository.deleteById(id);
    }
}
