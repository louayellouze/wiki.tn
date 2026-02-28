package api.tn.wiki.controller;

import api.tn.wiki.entity.HeroBanner;
import api.tn.wiki.service.HeroBannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hero-banners")
public class HeroBannerController {

    private final HeroBannerService heroBannerService;

    public HeroBannerController(HeroBannerService heroBannerService) {
        this.heroBannerService = heroBannerService;
    }

    @GetMapping
    public ResponseEntity<List<HeroBanner>> getActiveBanners(@RequestParam(required = false) String emplacement) {
        if (emplacement != null && !emplacement.isEmpty()) {
            return ResponseEntity.ok(heroBannerService.getBannersByEmplacement(emplacement));
        }
        return ResponseEntity.ok(heroBannerService.getActiveBanners());
    }

    @GetMapping("/all")
    public ResponseEntity<List<HeroBanner>> getAllBanners() {
        return ResponseEntity.ok(heroBannerService.getAllBanners());
    }

    @PostMapping
    public ResponseEntity<HeroBanner> createBanner(@RequestBody HeroBanner banner) {
        return ResponseEntity.ok(heroBannerService.createBanner(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HeroBanner> updateBanner(@PathVariable Long id, @RequestBody HeroBanner banner) {
        return ResponseEntity.ok(heroBannerService.updateBanner(id, banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        heroBannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<HeroBanner> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(heroBannerService.toggleActive(id));
    }
}
