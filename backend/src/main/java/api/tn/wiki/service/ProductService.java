package api.tn.wiki.service;

import api.tn.wiki.dto.ImageDto;
import api.tn.wiki.dto.SpecificationDto;
import api.tn.wiki.dto.request.ProductRequest;
import api.tn.wiki.dto.response.BrandResponse;
import api.tn.wiki.dto.response.ProductMinResponse;
import api.tn.wiki.dto.response.ProductResponse;
import api.tn.wiki.dto.response.ReviewResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import api.tn.wiki.utils.SlugUtils;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StopWatch;

import java.util.ArrayList;
import java.util.Map;
import java.util.Set;

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
    private final BrandRepository brandRepository;
    private final UserRepository userRepository;
    private final ProductSubscriptionRepository productSubscriptionRepository;
    private final EmailService emailService;

    public ProductService(ProductRepository productRepository,
                          ImageRepository imageRepository,
                          SpecKeyRepository specKeyRepository,
                          SpecValueRepository specValueRepository,
                          CategoryRepository categoryRepository,
                          HistoriqueService historiqueService,
                          UserRepository userRepository,
                          BrandRepository brandRepository,
                          ProductSubscriptionRepository productSubscriptionRepository,
                          EmailService emailService) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.specKeyRepository = specKeyRepository;
        this.specValueRepository = specValueRepository;
        this.categoryRepository = categoryRepository;
        this.historiqueService = historiqueService;
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.productSubscriptionRepository = productSubscriptionRepository;
        this.emailService = emailService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    @Transactional(readOnly = true)
    public List<ProductMinResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToMinResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductMinResponse> getAllProducts(Long categoryId, String stockStatus, Boolean isFlashSale, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            if (!Long.class.equals(query.getResultType())) {
                query.distinct(true);
            }
            return cb.conjunction();
        };

        if (categoryId != null) {
            java.util.List<Long> categoryIds = new java.util.ArrayList<>();
            collectCategoryIdsRecursive(categoryId, categoryIds);
            spec = spec.and((root, query, cb) -> {
                if (!Long.class.equals(query.getResultType())) {
                    Join<Product, Category> categoryJoin = root.join("categories");
                    return categoryJoin.get("id").in(categoryIds);
                }
                // COUNT query: subquery pour éviter le JOIN
                var sub = query.subquery(Integer.class);
                var subRoot = sub.from(Product.class);
                var subJoin = subRoot.join("categories");
                sub.select(subRoot.get("id")).where(subJoin.get("id").in(categoryIds));
                return root.get("id").in(sub);
            });
        }

        if (stockStatus != null && !stockStatus.trim().isEmpty()) {
            try {
                StockStatus status = StockStatus.valueOf(stockStatus.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("stockStatus"), status));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid stock status: {}", stockStatus);
            }
        }
        
        if (isFlashSale != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isFlashSale"), isFlashSale));
        }

        return productRepository.findAll(spec, pageable)
                .map(this::convertToMinResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductMinResponse> getFlashSaleProducts() {
        return productRepository.findByIsFlashSaleTrueOrderByIdDesc().stream()
                .map(this::convertToMinResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductMinResponse> getFlashSaleProducts(Pageable pageable) {
        return productRepository.findByIsFlashSaleTrue(pageable)
                .map(this::convertToMinResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return convertToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));
        return convertToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductMinResponse> getProductsByCategory(Long categoryId) {
        java.util.List<Long> categoryIds = new java.util.ArrayList<>();
        collectCategoryIdsRecursive(categoryId, categoryIds);
        
        return productRepository.findDistinctByCategories_IdIn(categoryIds).stream()
                .map(this::convertToMinResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductMinResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        java.util.List<Long> categoryIds = new java.util.ArrayList<>();
        collectCategoryIdsRecursive(categoryId, categoryIds);
        
        return productRepository.findDistinctByCategories_IdIn(categoryIds, pageable)
                .map(this::convertToMinResponse);
    }

    private void collectCategoryIdsRecursive(Long categoryId, java.util.List<Long> allIds) {
        categoryRepository.findById(categoryId).ifPresent(category -> {
            collectCategoryIdsRecursive(category, allIds);
        });
    }

    private void collectCategoryIdsRecursive(Category category, java.util.List<Long> allIds) {
        allIds.add(category.getId());
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            logger.info("Category '{}' (ID: {}) has {} sub-categories. Recursing...", category.getName(), category.getId(), category.getSubCategories().size());
            for (Category sub : category.getSubCategories()) {
                collectCategoryIdsRecursive(sub, allIds);
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getFilteredProducts(String categorySlug, String brandSlug, Map<String, List<String>> filters, Double minPrice, Double maxPrice, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            // distinct uniquement sur la requête principale, PAS sur la COUNT query
            // (COUNT(DISTINCT entity) avec JOIN cause des problèmes en Hibernate 6)
            if (!Long.class.equals(query.getResultType())) {
                query.distinct(true);
            }
            return cb.conjunction();
        };

        if (categorySlug != null && !categorySlug.isEmpty()) {
            java.util.Optional<Category> optCategory = categoryRepository.findBySlug(categorySlug);
            if(optCategory.isPresent()) {
                 java.util.List<Long> categoryIds = new java.util.ArrayList<>();
                 collectCategoryIdsRecursive(optCategory.get(), categoryIds);
                 logger.info("Filtering by category slug: '{}', found {} associated category IDs (including sub-categories): {}", categorySlug, categoryIds.size(), categoryIds);
                 spec = spec.and((root, query, cb) -> {
                     if (!Long.class.equals(query.getResultType())) {
                         // Requête principale : JOIN pour filtrer + distinct
                         Join<Product, Category> categoryJoin = root.join("categories");
                         return categoryJoin.get("id").in(categoryIds);
                     }
                     // COUNT query : subquery pour éviter COUNT(DISTINCT entity) + JOIN
                     var sub = query.subquery(Integer.class);
                     var subRoot = sub.from(Product.class);
                     var subJoin = subRoot.join("categories");
                     sub.select(subRoot.get("id")).where(subJoin.get("id").in(categoryIds));
                     return root.get("id").in(sub);
                 });
            } else {
                 // If slug not found, return false predicate
                 spec = spec.and((root, query, cb) -> cb.disjunction());
            }
        }

        if (brandSlug != null && !brandSlug.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                Join<Product, Brand> brandJoin = root.join("brand");
                return cb.equal(brandJoin.get("slug"), brandSlug);
            });
        }

        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(
                    cb.coalesce(root.get("discountPrice"), root.get("regularPrice")), minPrice));
        }

        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(
                    cb.coalesce(root.get("discountPrice"), root.get("regularPrice")), maxPrice));
        }

        if (filters != null && !filters.isEmpty()) {
            for (Map.Entry<String, List<String>> entry : filters.entrySet()) {
                String keyName = entry.getKey();
                List<String> values = entry.getValue();
                if (values != null && !values.isEmpty()) {
                    spec = spec.and((root, query, cb) -> {
                        Join<Product, SpecValue> specJoin = root.join("specifications");
                        Predicate keyPredicate = cb.equal(specJoin.get("specKey").get("name"), keyName);
                        Predicate valuePredicate = specJoin.get("value").in(values);
                        return cb.and(keyPredicate, valuePredicate);
                    });
                }
            }
        }

        return productRepository.findAll(spec, pageable).map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductMinResponse> searchProducts(String query, Long categoryId, String stockStatus, Boolean isFlashSale) {
        String trimmed = query.trim().replaceAll("\\s+", " ");
        String[] words = trimmed.split(" ");
        StringBuilder prefixBuilder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            String word = words[i].replaceAll("[^a-zA-Z0-9]", "");
            if (word.length() >= 1) {
                if (prefixBuilder.length() > 0) prefixBuilder.append(" | ");
                prefixBuilder.append(word);
                if (i == words.length - 1 && word.length() > 1) {
                    prefixBuilder.append(":*");
                }
            }
        }
        
        // Fallback: if cleaning words made prefix empty but we had original query, use plain original
        String queryPrefix = prefixBuilder.length() > 0 ? prefixBuilder.toString() : trimmed;
        
        java.util.List<Long> categoryIds = null;
        if (categoryId != null) {
            categoryIds = new java.util.ArrayList<>();
            collectCategoryIdsRecursive(categoryId, categoryIds);
        }
        
        // Use simplified query for Chatbot to avoid native SQL exceptions with NULL collections
        List<Product> results;
        if (categoryId == null && stockStatus == null && isFlashSale == null) {
            results = productRepository.searchProductsSimple(queryPrefix, trimmed);
        } else {
            results = productRepository.searchProducts(queryPrefix, trimmed, stockStatus, categoryIds, isFlashSale);
        }
        
        // Fallback for Chatbot: if no results found with complex search, try title OR brand search
        if (results.isEmpty() && trimmed.length() >= 2) {
            logger.info("Search returned 0 results for '{}', trying title/brand fallback...", trimmed);
            // Search in title OR in associated brand name
            results = productRepository.findByTitleContainingIgnoreCaseOrBrand_NameContainingIgnoreCase(trimmed, trimmed);
        }

        return results.stream()
                .map(this::convertToMinResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductMinResponse> searchProducts(String query, Long categoryId, String stockStatus, Boolean isFlashSale, Pageable pageable) {
        String trimmed = query.trim().replaceAll("\\s+", " ");
        String[] words = trimmed.split(" ");
        StringBuilder prefixBuilder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            String word = words[i].replaceAll("[^a-zA-Z0-9]", "");
            if (word.length() >= 1) {
                if (prefixBuilder.length() > 0) prefixBuilder.append(" | ");
                prefixBuilder.append(word);
                if (i == words.length - 1 && word.length() > 1) {
                    prefixBuilder.append(":*");
                }
            }
        }
        String queryPrefix = prefixBuilder.length() > 0 ? prefixBuilder.toString() : trimmed;
        
        java.util.List<Long> categoryIds = null;
        if (categoryId != null) {
            categoryIds = new java.util.ArrayList<>();
            collectCategoryIdsRecursive(categoryId, categoryIds);
        }
        
        return productRepository.searchProducts(queryPrefix, trimmed, stockStatus, categoryIds, isFlashSale, pageable)
                .map(this::convertToMinResponse);
    }

    @Transactional(readOnly = true)
    public List<api.tn.wiki.dto.response.ProductSearchDto> searchProductsAutocomplete(String query) {
        // Build prefix tsquery: "asus rog" -> "asus & rog:*"
        // This allows tsvector prefix matching on the last typed word
        String trimmed = query.trim().replaceAll("\\s+", " ");
        String[] words = trimmed.split(" ");
        StringBuilder prefixBuilder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            String word = words[i].replaceAll("[^a-zA-Z0-9]", "");
            if (word.length() >= 1) {
                if (prefixBuilder.length() > 0) prefixBuilder.append(" | ");
                prefixBuilder.append(word);
                if (i == words.length - 1 && word.length() > 1) {
                    prefixBuilder.append(":*");
                }
            }
        }
        String queryPrefix = prefixBuilder.length() > 0 ? prefixBuilder.toString() : trimmed;

        List<Object[]> rows = productRepository.searchProductsAutocomplete(queryPrefix, trimmed);
        return rows.stream().map(row -> new api.tn.wiki.dto.response.ProductSearchDto(
                row[0] != null ? ((Number) row[0]).intValue() : null,
                row[1] != null ? row[1].toString() : null,
                row[2] != null ? ((Number) row[2]).doubleValue() : null,
                row[3] != null ? ((Number) row[3]).doubleValue() : null,
                row[4] != null ? row[4].toString() : null,
                row[5] != null ? row[5].toString() : null, // slug
                row[6] != null ? row[6].toString() : null, // imageUrl
                row[7] != null ? row[7].toString() : null  // brandName
        )).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setSlug(SlugUtils.makeSlug(request.getTitle()));
        product.setDescription(request.getDescription());
        product.setRegularPrice(request.getRegularPrice());
        product.setQuantity(request.getQuantity());
        product.setCodeSage(request.getCodeSage());
        product.setReference(request.getReference());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setFlashSale(request    .isFlashSale());
        
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

        // Set brand
        if (request.getBrandId() != null) {
            brandRepository.findById(request.getBrandId())
                .ifPresent(product::setBrand);
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

        if (request.getTitle() != null) {
            product.setTitle(request.getTitle().trim());
            product.setSlug(SlugUtils.makeSlug(request.getTitle().trim()));
        }
        if (request.getDescription() != null) product.setDescription(request.getDescription().trim());
        if (request.getRegularPrice() != null) product.setRegularPrice(request.getRegularPrice());
        if (request.getQuantity() != null) product.setQuantity(request.getQuantity());
        if (request.getCodeSage() != null) product.setCodeSage(request.getCodeSage().trim());
        if (request.getReference() != null) product.setReference(request.getReference().trim());
        if (request.getDiscountPrice() != null) product.setDiscountPrice(request.getDiscountPrice());
        product.setFlashSale(request.isFlashSale());
        
        if (request.getStockStatus() != null) {
            try {
                product.setStockStatus(StockStatus.valueOf(request.getStockStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing status
            }
        }
        
        // AUTO-STATUS Logic (Flexible Refinement)
        StockStatus oldStatus = product.getStockStatus();
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

        // Trigger notifications if status changed from HORS_STOCK to EN_STOCK
        if (oldStatus == StockStatus.HORS_STOCK && product.getStockStatus() == StockStatus.EN_STOCK) {
            notifySubscribers(product);
        }

        // Update brand
        if (request.getBrandId() != null) {
            brandRepository.findById(request.getBrandId())
                .ifPresent(product::setBrand);
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

    private ProductMinResponse convertToMinResponse(Product product) {
        String firstImageUrl = product.getImages() != null && !product.getImages().isEmpty() 
                ? product.getImages().iterator().next().getImageUrl() 
                : null;

        java.util.List<api.tn.wiki.dto.response.CategoryResponse> categoryResponses = product.getCategories() == null ? java.util.Collections.emptyList() : product.getCategories().stream()
                .map(cat -> api.tn.wiki.dto.response.CategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .slug(cat.getSlug())
                        .build())
                .collect(Collectors.toList());

        return ProductMinResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .regularPrice(product.getRegularPrice())
                .discountPrice(product.getDiscountPrice())
                .stockStatus(product.getStockStatus() != null ? product.getStockStatus().name() : null)
                .imageUrl(firstImageUrl)
                .isFlashSale(product.isFlashSale() != null && product.isFlashSale())
                .reference(product.getReference())
                .codeSage(product.getCodeSage())
                .quantity(product.getQuantity())
                .categories(categoryResponses)
                .build();
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
                        .slug(cat.getSlug())
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
                            fullName.trim(),
                            product.getId(),
                            product.getTitle(),
                            firstImageUrl,
                            review.getSentiment(),
                            review.getSentimentScore()
                    );
                })
                .collect(Collectors.toList());

        Double averageRating = product.getReviews().isEmpty() ? 0.0 :
                product.getReviews().stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);

        ProductResponse response = new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getSlug(),
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

        if (product.getBrand() != null) {
            BrandResponse brandResponse = new BrandResponse();
            brandResponse.setId(product.getBrand().getId());
            brandResponse.setName(product.getBrand().getName());
            brandResponse.setSlug(product.getBrand().getSlug());
            brandResponse.setLogoUrl(product.getBrand().getLogoUrl());
            brandResponse.setDescription(product.getBrand().getDescription());
            response.setBrand(brandResponse);
        }

        response.setFlashSale(product.isFlashSale() != null && product.isFlashSale());

        return response;
    }
    @Transactional(readOnly = true)
    public List<ProductMinResponse> getLowStockProducts(int threshold) {
        return productRepository.findByQuantityLessThanEqual(threshold).stream()
                .map(this::convertToMinResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void regenerateAllSlugs() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            String newSlug = SlugUtils.makeSlug(product.getTitle());
            product.setSlug(newSlug);
        }
        productRepository.saveAll(products);
    }

    @Transactional
    public void notifySubscribers(Product product) {
        List<ProductSubscription> subscriptions = productSubscriptionRepository.findByProductAndNotifiedFalse(product);
        for (ProductSubscription sub : subscriptions) {
            try {
                emailService.sendStockNotificationEmail(sub.getUser(), product);
                sub.setNotified(true);
            } catch (Exception e) {
                logger.error("Failed to notify user {} for product {}", sub.getUser().getUsername(), product.getTitle(), e);
            }
        }
        productSubscriptionRepository.saveAll(subscriptions);
    }
}
