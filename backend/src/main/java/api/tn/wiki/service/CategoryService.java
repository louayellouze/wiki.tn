package api.tn.wiki.service;

import api.tn.wiki.dto.response.CategoryMinResponse;
import api.tn.wiki.dto.response.CategoryResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.CategoryRepository;
import api.tn.wiki.repository.UserRepository;
import api.tn.wiki.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final HistoriqueService historiqueService;
    private final UserRepository userRepository;
    
    // Tracks the timestamp of the last category mutation
    private final AtomicLong lastUpdateTimestamp = new AtomicLong(System.currentTimeMillis());

    public CategoryService(CategoryRepository categoryRepository, 
                          HistoriqueService historiqueService,
                          UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.historiqueService = historiqueService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public Long getLastUpdateTimestamp() {
        return lastUpdateTimestamp.get();
    }

    public List<CategoryMinResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToMinResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public Page<CategoryMinResponse> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(this::mapToMinResponse);
    }

    public List<CategoryResponse> getCategoryTree() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(api.tn.wiki.dto.request.CategoryRequest request) {
        String normalizedName = request.getName().trim().toUpperCase();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new RuntimeException("Category with name '" + normalizedName + "' already exists");
        }

        Category category = new Category();
        category.setName(normalizedName);
        category.setSlug(SlugUtils.makeSlug(normalizedName));
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setFeatured(request.isFeatured());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + request.getParentId()));
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Création de la catégorie: " + savedCategory.getName();
        historiqueService.logAction(ActionType.CREATE, EntityType.CATEGORY, details, savedCategory.getId(), currentUser);
        
        lastUpdateTimestamp.set(System.currentTimeMillis());
        
        return mapToResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, api.tn.wiki.dto.request.CategoryRequest request) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        String normalizedName = request.getName().trim().toUpperCase();
        
        // Check for duplicates if name changed (ignoring case)
        if (!existingCategory.getName().equalsIgnoreCase(normalizedName) && 
            categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new RuntimeException("Category with name '" + normalizedName + "' already exists");
        }

        String oldName = existingCategory.getName();
        existingCategory.setName(normalizedName);
        existingCategory.setSlug(SlugUtils.makeSlug(normalizedName));
        existingCategory.setDescription(request.getDescription());
        existingCategory.setImageUrl(request.getImageUrl());
        existingCategory.setFeatured(request.isFeatured());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + request.getParentId()));
            existingCategory.setParent(parent);
        } else {
            existingCategory.setParent(null);
        }

        Category savedCategory = categoryRepository.save(existingCategory);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Modification de la catégorie: " + oldName + " → " + savedCategory.getName();
        historiqueService.logAction(ActionType.UPDATE, EntityType.CATEGORY, details, savedCategory.getId(), currentUser);
        
        lastUpdateTimestamp.set(System.currentTimeMillis());
        
        return mapToResponse(savedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        // Remove category from all associated products to avoid foreign key constraint violations
        for (Product product : category.getProducts()) {
            product.getCategories().remove(category);
        }
        category.getProducts().clear();
        
        String categoryName = category.getName();
        categoryRepository.deleteById(id);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Suppression de la catégorie: " + categoryName;
        historiqueService.logAction(ActionType.DELETE, EntityType.CATEGORY, details, id, currentUser);
        
        lastUpdateTimestamp.set(System.currentTimeMillis());
    }

    private CategoryMinResponse mapToMinResponse(Category category) {
        return CategoryMinResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .isFeatured(category.isFeatured() != null && category.isFeatured())
                .build();
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setFeatured(category.isFeatured() != null && category.isFeatured());
        if (category.getParent() != null) {
            response.setParentId(category.getParent().getId());
            response.setParentName(category.getParent().getName());
            response.setParentSlug(category.getParent().getSlug());
        }
        
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            response.setSubCategories(category.getSubCategories().stream()
                    .map(this::mapToResponse) // Recursion
                    .collect(java.util.stream.Collectors.toList()));
        }
        
        return response;
    }
}
