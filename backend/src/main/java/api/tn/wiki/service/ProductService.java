package api.tn.wiki.service;

import api.tn.wiki.dto.ImageDto;
import api.tn.wiki.dto.SpecificationDto;
import api.tn.wiki.dto.request.ProductRequest;
import api.tn.wiki.dto.response.ProductResponse;
import api.tn.wiki.dto.response.ReviewResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StopWatch;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

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

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        java.util.List<Long> categoryIds = new java.util.ArrayList<>();
        collectCategoryIdsRecursive(categoryId, categoryIds);
        
        return productRepository.findByCategories_IdIn(categoryIds).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private void collectCategoryIdsRecursive(Long categoryId, java.util.List<Long> allIds) {
        allIds.add(categoryId);
        categoryRepository.findById(categoryId).ifPresent(category -> {
            for (Category sub : category.getSubCategories()) {
                collectCategoryIdsRecursive(sub.getId(), allIds);
            }
        });
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String query) {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        
        String trimmed = query.trim().replaceAll("\\s+", " ");
        String[] words = trimmed.split(" ");
        StringBuilder prefixBuilder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (!words[i].isEmpty()) {
                if (prefixBuilder.length() > 0) prefixBuilder.append(" & ");
                prefixBuilder.append(words[i]);
                if (i == words.length - 1) prefixBuilder.append(":*");
            }
        }
        String queryPrefix = prefixBuilder.toString();

        List<ProductResponse> results = productRepository.searchProducts(queryPrefix, trimmed).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        stopWatch.stop();
        logger.info("Recherche pour '{}' exécutée en {} ms (queryPrefix: '{}', {} résultats)", 
                query, stopWatch.getTotalTimeMillis(), queryPrefix, results.size());
        
        return results;
    }

    @Transactional(readOnly = true)
    public List<api.tn.wiki.dto.response.ProductSearchDto> searchProductsAutocomplete(String query) {
        // Build prefix tsquery: "asus rog" -> "asus & rog:*"
        // This allows tsvector prefix matching on the last typed word
        String trimmed = query.trim().replaceAll("\\s+", " ");
        String[] words = trimmed.split(" ");
        StringBuilder prefixBuilder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (!words[i].isEmpty()) {
                if (prefixBuilder.length() > 0) prefixBuilder.append(" & ");
                prefixBuilder.append(words[i]);
                if (i == words.length - 1) prefixBuilder.append(":*");
            }
        }
        String queryPrefix = prefixBuilder.toString();

        List<Object[]> rows = productRepository.searchProductsAutocomplete(queryPrefix, trimmed);
        return rows.stream().map(row -> new api.tn.wiki.dto.response.ProductSearchDto(
                row[0] != null ? ((Number) row[0]).intValue() : null,
                row[1] != null ? row[1].toString() : null,
                row[2] != null ? ((Number) row[2]).doubleValue() : null,
                row[3] != null ? ((Number) row[3]).doubleValue() : null,
                row[4] != null ? row[4].toString() : null,
                row[5] != null ? row[5].toString() : null
        )).collect(Collectors.toList());
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
            // Default based on quantity rule (> 1 to be in stock)
            if (product.getQuantity() != null && product.getQuantity() <= 1) {
                product.setStockStatus(StockStatus.HORS_STOCK);
            } else {
                product.setStockStatus(StockStatus.EN_STOCK);
            }
        }
        
        // AUTO-STATUS Logic (Enforced Refinement)
        // AUTO-STATUS Logic (Flexible Refinement)
        if (product.getQuantity() != null) {
            if (product.getQuantity() <= 0) {
                product.setQuantity(0);
                // Force Hors Stock only if it was "En Stock"
                if (product.getStockStatus() == StockStatus.EN_STOCK) {
                    product.setStockStatus(StockStatus.HORS_STOCK);
                }
            } else {
                // Force En Stock only if it was "Hors Stock"
                if (product.getStockStatus() == StockStatus.HORS_STOCK) {
                    product.setStockStatus(StockStatus.EN_STOCK);
                }
            }
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
        
        // AUTO-STATUS Logic (Enforced Refinement)
        // AUTO-STATUS Logic (Flexible Refinement)
        if (product.getQuantity() != null) {
            if (product.getQuantity() <= 0) {
                product.setQuantity(0);
                // Force Hors Stock only if it was "En Stock"
                if (product.getStockStatus() == StockStatus.EN_STOCK) {
                    product.setStockStatus(StockStatus.HORS_STOCK);
                }
            } else {
                // Force En Stock only if it was "Hors Stock"
                if (product.getStockStatus() == StockStatus.HORS_STOCK) {
                    product.setStockStatus(StockStatus.EN_STOCK);
                }
            }
        }

        // Update categories
        if (request.getCategoryIds() != null) {
            if (request.getCategoryIds().isEmpty()) {
                product.setCategories(new java.util.HashSet<>());
            } else {
                List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
                product.setCategories(new java.util.HashSet<>(categories));
            }
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

        List<ReviewResponse> reviewResponses = product.getReviews().stream()
                .map(review -> {
                    String fullName = review.getUser().getFirstName() + " " + review.getUser().getLastName();
                    return new ReviewResponse(
                            review.getId(),
                            review.getRating(),
                            review.getComment(),
                            review.getCreatedAt(),
                            review.getUser().getUsername(),
                            fullName.trim()
                    );
                })
                .collect(Collectors.toList());

        Double averageRating = product.getReviews().isEmpty() ? 0.0 :
                product.getReviews().stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);

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
                specDtos,
                averageRating,
                reviewResponses
        );
    }
}
