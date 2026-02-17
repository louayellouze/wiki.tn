package api.tn.wiki.service;

import api.tn.wiki.dto.ImageDto;
import api.tn.wiki.dto.SpecificationDto;
import api.tn.wiki.dto.request.ProductRequest;
import api.tn.wiki.dto.response.ProductResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final SpecKeyRepository specKeyRepository;
    private final SpecValueRepository specValueRepository;
    private final CategoryRepository categoryRepository;
    private final HistoriqueService historiqueService;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          ImageRepository imageRepository,
                          SpecKeyRepository specKeyRepository,
                          SpecValueRepository specValueRepository,
                          CategoryRepository categoryRepository,
                          HistoriqueService historiqueService,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.specKeyRepository = specKeyRepository;
        this.specValueRepository = specValueRepository;
        this.categoryRepository = categoryRepository;
        this.historiqueService = historiqueService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return convertToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setRegularPrice(request.getRegularPrice());
        product.setQuantity(request.getQuantity());
        product.setCodeSage(request.getCodeSage());
        product.setReference(request.getReference());
        product.setDiscountPrice(request.getDiscountPrice());
        
        if (request.getStockStatus() != null) {
            try {
                product.setStockStatus(StockStatus.valueOf(request.getStockStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                product.setStockStatus(StockStatus.EN_STOCK);
            }
        } else {
            product.setStockStatus(StockStatus.EN_STOCK);
        }
        
        // AUTO-STATUS: If quantity is 0, override to HORS_STOCK
        if (product.getQuantity() != null && product.getQuantity() == 0) {
            product.setStockStatus(StockStatus.HORS_STOCK);
        }

        // Set categories
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            product.setCategories(new java.util.HashSet<>(categories));
        }

        // Add images - set associations before save with normalization and deduplication
        if (request.getImages() != null) {
            request.getImages().stream()
                .filter(img -> img.getImageUrl() != null)
                .map(img -> {
                    img.setImageUrl(img.getImageUrl().trim());
                    if (img.getAlt() != null) img.setAlt(img.getAlt().trim());
                    return img;
                })
                .distinct()
                .forEach(imageDto -> {
                    Image image = new Image();
                    image.setImageUrl(imageDto.getImageUrl());
                    image.setAlt(imageDto.getAlt());
                    image.setProduct(product);
                    product.getImages().add(image);
                });
        }

        // Add specifications - set associations before save with normalization and deduplication
        if (request.getSpecifications() != null) {
            request.getSpecifications().stream()
                .filter(spec -> spec.getKeyId() != null && spec.getValue() != null)
                .map(spec -> {
                    spec.setValue(spec.getValue().trim());
                    return spec;
                })
                .distinct()
                .forEach(specDto -> {
                    SpecKey specKey = specKeyRepository.findById(specDto.getKeyId())
                            .orElseThrow(() -> new RuntimeException("SpecKey not found with id: " + specDto.getKeyId()));
                    
                    SpecValue specValue = new SpecValue();
                    specValue.setValue(specDto.getValue());
                    specValue.setSpecKey(specKey);
                    specValue.setProduct(product);
                    product.getSpecifications().add(specValue);
                });
        }

        Product savedProduct = productRepository.save(product);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Création du produit: " + savedProduct.getTitle() + " (Ref: " + savedProduct.getReference() + ")";
        historiqueService.logAction(ActionType.CREATE, EntityType.PRODUCT, details, savedProduct.getId().longValue(), currentUser);
        
        return convertToResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (request.getTitle() != null) product.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) product.setDescription(request.getDescription().trim());
        if (request.getRegularPrice() != null) product.setRegularPrice(request.getRegularPrice());
        if (request.getQuantity() != null) product.setQuantity(request.getQuantity());
        if (request.getCodeSage() != null) product.setCodeSage(request.getCodeSage().trim());
        if (request.getReference() != null) product.setReference(request.getReference().trim());
        if (request.getDiscountPrice() != null) product.setDiscountPrice(request.getDiscountPrice());
        
        if (request.getStockStatus() != null) {
            try {
                product.setStockStatus(StockStatus.valueOf(request.getStockStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing status
            }
        }
        
        // AUTO-STATUS Logic
        if (product.getQuantity() != null) {
            if (product.getQuantity() == 0) {
                // If quantity is 0, must be HORS_STOCK
                product.setStockStatus(StockStatus.HORS_STOCK);
            } else if (product.getQuantity() > 0 && product.getStockStatus() == StockStatus.HORS_STOCK) {
                // If quantity becomes > 0 and it was HORS_STOCK, switch to EN_STOCK 
                // unless the user specifically requested another status (like EN_ARRIVAGE) 
                // in this same update request.
                if (request.getStockStatus() == null || request.getStockStatus().equalsIgnoreCase("HORS_STOCK")) {
                    product.setStockStatus(StockStatus.EN_STOCK);
                }
            }
        }

        // Update categories
        if (request.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            product.setCategories(new java.util.HashSet<>(categories));
        }

        // Update images if provided - manage collection via entity with deduplication
        if (request.getImages() != null) {
            product.getImages().clear();
            request.getImages().stream()
                .filter(img -> img.getImageUrl() != null)
                .map(img -> {
                    img.setImageUrl(img.getImageUrl().trim());
                    if (img.getAlt() != null) img.setAlt(img.getAlt().trim());
                    return img;
                })
                .distinct()
                .forEach(imageDto -> {
                    Image image = new Image();
                    image.setImageUrl(imageDto.getImageUrl());
                    image.setAlt(imageDto.getAlt());
                    image.setProduct(product);
                    product.getImages().add(image);
                });
        }

        // Update specifications if provided - manage collection via entity with deduplication
        if (request.getSpecifications() != null) {
            product.getSpecifications().clear();
            request.getSpecifications().stream()
                .filter(spec -> spec.getKeyId() != null && spec.getValue() != null)
                .map(spec -> {
                    spec.setValue(spec.getValue().trim());
                    return spec;
                })
                .distinct()
                .forEach(specDto -> {
                    SpecKey specKey = specKeyRepository.findById(specDto.getKeyId())
                            .orElseThrow(() -> new RuntimeException("SpecKey not found with id: " + specDto.getKeyId()));
                    
                    SpecValue specValue = new SpecValue();
                    specValue.setValue(specDto.getValue());
                    specValue.setSpecKey(specKey);
                    specValue.setProduct(product);
                    product.getSpecifications().add(specValue);
                });
        }

        Product savedProduct = productRepository.save(product);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Modification du produit: " + savedProduct.getTitle() + " (Ref: " + savedProduct.getReference() + ")";
        historiqueService.logAction(ActionType.UPDATE, EntityType.PRODUCT, details, savedProduct.getId().longValue(), currentUser);
        
        return convertToResponse(savedProduct);
    }

    @Transactional
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        String productTitle = product.getTitle();
        String productRef = product.getReference();
        productRepository.deleteById(id);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Suppression du produit: " + productTitle + " (Ref: " + productRef + ")";
        historiqueService.logAction(ActionType.DELETE, EntityType.PRODUCT, details, id.longValue(), currentUser);
    }

    private ProductResponse convertToResponse(Product product) {
        List<ImageDto> imageDtos = product.getImages().stream()
                .map(img -> new ImageDto(img.getId(), img.getImageUrl(), img.getAlt()))
                .distinct()
                .collect(Collectors.toList());

        List<SpecificationDto> specDtos = product.getSpecifications().stream()
                .map(spec -> new SpecificationDto(
                        spec.getId(),
                        spec.getSpecKey().getName(),
                        spec.getSpecKey().getId(),
                        spec.getValue()
                ))
                .distinct()
                .collect(Collectors.toList());

        List<api.tn.wiki.dto.response.CategoryResponse> categoryResponses = product.getCategories().stream()
                .map(cat -> api.tn.wiki.dto.response.CategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                        .parentName(cat.getParent() != null ? cat.getParent().getName() : null)
                        .build())
                .collect(Collectors.toList());

        String firstImageUrl = !imageDtos.isEmpty() ? imageDtos.get(0).getImageUrl() : null;

        return new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getRegularPrice(),
                product.getQuantity(),
                categoryResponses,
                product.getCodeSage(),
                product.getReference(),
                product.getDiscountPrice(),
                product.getStockStatus() != null ? product.getStockStatus().name() : null,
                firstImageUrl,
                imageDtos,
                specDtos
        );
    }
}
