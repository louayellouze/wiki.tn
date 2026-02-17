package api.tn.wiki.service;

import api.tn.wiki.dto.response.CategoryResponse;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.CategoryRepository;
import api.tn.wiki.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final HistoriqueService historiqueService;
    private final UserRepository userRepository;

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

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryResponse(
                        cat.getId(),
                        cat.getName(),
                        cat.getDescription(),
                        cat.getImageUrl(),
                        cat.getParent() != null ? cat.getParent().getId() : null,
                        cat.getParent() != null ? cat.getParent().getName() : null
                ))
                .collect(java.util.stream.Collectors.toList());
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

    @Transactional
    public CategoryResponse createCategory(api.tn.wiki.dto.request.CategoryRequest request) {
        String normalizedName = request.getName().trim().toUpperCase();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new RuntimeException("Category with name '" + normalizedName + "' already exists");
        }

        Category category = new Category();
        category.setName(normalizedName);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

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
        existingCategory.setDescription(request.getDescription());
        existingCategory.setImageUrl(request.getImageUrl());

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
        
        return mapToResponse(savedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        String categoryName = category.getName();
        categoryRepository.deleteById(id);
        
        // Log history
        User currentUser = getCurrentUser();
        String details = "Suppression de la catégorie: " + categoryName;
        historiqueService.logAction(ActionType.DELETE, EntityType.CATEGORY, details, id, currentUser);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        if (category.getParent() != null) {
            response.setParentId(category.getParent().getId());
            response.setParentName(category.getParent().getName());
        }
        
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            response.setSubCategories(category.getSubCategories().stream()
                    .map(this::mapToResponse) // Recursion
                    .collect(java.util.stream.Collectors.toList()));
        }
        
        return response;
    }
}
