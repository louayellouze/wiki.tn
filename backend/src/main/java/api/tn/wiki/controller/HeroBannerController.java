package api.tn.wiki.controller;

import api.tn.wiki.entity.HeroBanner;
import api.tn.wiki.service.HeroBannerService;
import api.tn.wiki.dto.response.HeroBannerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<List<HeroBannerResponse>> getActiveBanners(@RequestParam(required = false) String emplacement) {
        if (emplacement != null && !emplacement.isEmpty()) {
            return ResponseEntity.ok(heroBannerService.getBannersByEmplacement(emplacement));
        }
        return ResponseEntity.ok(heroBannerService.getActiveBanners());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<HeroBannerResponse>> getAllBannersPaginated(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(heroBannerService.getAllBanners(pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<List<HeroBannerResponse>> getAllBanners() {
        return ResponseEntity.ok(heroBannerService.getAllBanners());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<HeroBannerResponse> createBanner(@RequestBody HeroBanner banner) {
        return ResponseEntity.ok(heroBannerService.createBanner(banner));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<HeroBannerResponse> updateBanner(@PathVariable Long id, @RequestBody HeroBanner banner) {
        return ResponseEntity.ok(heroBannerService.updateBanner(id, banner));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        heroBannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<HeroBannerResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(heroBannerService.toggleActive(id));
    }
}
