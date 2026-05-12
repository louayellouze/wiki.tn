package api.tn.wiki.service;

import api.tn.wiki.dto.request.BrandRequest;
import api.tn.wiki.dto.response.BrandResponse;
import api.tn.wiki.entity.Brand;
import api.tn.wiki.repository.BrandRepository;
import api.tn.wiki.utils.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public Page<BrandResponse> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getBrandById(Long id) {
        return brandRepository.findById(id)
                .map(this::convertToResponse)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    public BrandResponse createBrand(BrandRequest request) {
        Brand brand = new Brand();
        brand.setName(request.getName());
        brand.setSlug(SlugUtils.makeSlug(request.getName()));
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        return convertToResponse(brandRepository.save(brand));
    }

    public BrandResponse updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        brand.setName(request.getName());
        brand.setSlug(SlugUtils.makeSlug(request.getName()));
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        return convertToResponse(brandRepository.save(brand));
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }

    private BrandResponse convertToResponse(Brand brand) {
        BrandResponse response = new BrandResponse();
        response.setId(brand.getId());
        response.setName(brand.getName());
        response.setSlug(brand.getSlug());
        response.setDescription(brand.getDescription());
        response.setLogoUrl(brand.getLogoUrl());
        return response;
    }
}
