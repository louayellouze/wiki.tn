package api.tn.wiki.service;

import api.tn.wiki.dto.response.SpecFilterResponse;
import api.tn.wiki.dto.response.SpecKeyResponse;
import api.tn.wiki.entity.Category;
import api.tn.wiki.entity.SpecKey;
import api.tn.wiki.repository.CategoryRepository;
import api.tn.wiki.repository.SpecKeyRepository;
import api.tn.wiki.repository.SpecValueRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SpecKeyService {

    private final SpecKeyRepository specKeyRepository;
    private final SpecValueRepository specValueRepository;
    private final CategoryRepository categoryRepository;

    public SpecKeyService(SpecKeyRepository specKeyRepository, 
                          SpecValueRepository specValueRepository,
                          CategoryRepository categoryRepository) {
        this.specKeyRepository = specKeyRepository;
        this.specValueRepository = specValueRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<SpecKeyResponse> getAllSpecKeys(Pageable pageable) {
        return specKeyRepository.findAll(pageable)
                .map(key -> new SpecKeyResponse(key.getId(), key.getName()));
    }

    public List<SpecKeyResponse> getAllSpecKeysList() {
        return specKeyRepository.findAll().stream()
                .map(key -> new SpecKeyResponse(key.getId(), key.getName()))
                .collect(Collectors.toList());
    }

    public List<SpecKeyResponse> getAllSpecKeys() {
        return getAllSpecKeysList();
    }

    public List<SpecKeyResponse> getSpecKeysByCategory(Long categoryId) {
        List<Long> categoryIds = new java.util.ArrayList<>();
        collectCategoryIdsRecursive(categoryId, categoryIds);
        
        return specKeyRepository.findSpecKeysByCategoryIds(categoryIds).stream()
                .map(key -> new SpecKeyResponse(key.getId(), key.getName()))
                .collect(Collectors.toList());
    }

    public List<SpecKeyResponse> getSpecKeysBySearch(String query) {
        return specKeyRepository.searchSpecKeys(query).stream()
                .map(key -> new SpecKeyResponse(key.getId(), key.getName()))
                .collect(Collectors.toList());
    }

    private void collectCategoryIdsRecursive(Long categoryId, List<Long> allIds) {
        categoryRepository.findById(categoryId).ifPresent(category -> {
            collectCategoryIdsRecursive(category, allIds);
        });
    }

    private void collectCategoryIdsRecursive(Category category, List<Long> allIds) {
        allIds.add(category.getId());
        if (category.getSubCategories() != null) {
            for (Category sub : category.getSubCategories()) {
                collectCategoryIdsRecursive(sub, allIds);
            }
        }
    }

    @Transactional
    public SpecKeyResponse createSpecKey(String name) {
        if (specKeyRepository.existsByName(name)) {
            throw new RuntimeException("SpecKey with name '" + name + "' already exists");
        }

        SpecKey specKey = new SpecKey();
        specKey.setName(name);
        
        SpecKey saved = specKeyRepository.save(specKey);
        return new SpecKeyResponse(saved.getId(), saved.getName());
    }

    @Transactional
    public SpecKeyResponse updateSpecKey(Integer id, String name) {
        SpecKey specKey = specKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SpecKey not found with id: " + id));

        // Optional: Check if the name is already taken by another key
        specKeyRepository.findByName(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("SpecKey with name '" + name + "' already exists");
            }
        });

        specKey.setName(name);
        
        SpecKey saved = specKeyRepository.save(specKey);
        return new SpecKeyResponse(saved.getId(), saved.getName());
    }

    public List<String> getUniqueValuesForKey(Integer id, Long categoryId, String query) {
        if (query != null && !query.trim().isEmpty()) {
            return specValueRepository.searchDistinctValuesBySpecKey(id, query);
        } else if (categoryId != null) {
            List<Long> categoryIds = new java.util.ArrayList<>();
            collectCategoryIdsRecursive(categoryId, categoryIds);
            return specValueRepository.findDistinctValuesBySpecKeyAndCategoryIds(id, categoryIds);
        } else {
            return specValueRepository.findBySpecKeyId(id).stream()
                    .map(api.tn.wiki.entity.SpecValue::getValue)
                    .distinct()
                    .collect(Collectors.toList());
        }
    }

    public List<SpecFilterResponse> getSpecFiltersByCategorySlug(String categorySlug) {
        Category category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + categorySlug));
        return getSpecFiltersByCategory(category.getId());
    }

    public List<SpecFilterResponse> getSpecFiltersByCategory(Long categoryId) {
        List<Long> categoryIds = new ArrayList<>();
        collectCategoryIdsRecursive(categoryId, categoryIds);
        
        List<SpecKey> keys = specKeyRepository.findSpecKeysByCategoryIds(categoryIds);
        if (keys.isEmpty()) return new ArrayList<>();

        List<Object[]> rawValues = specValueRepository.findRawSpecsByCategoryIds(categoryIds);
        
        Map<Integer, List<String>> valuesById = new HashMap<>();
        for (Object[] row : rawValues) {
            Integer keyId = (Integer) row[0];
            String value = (String) row[1];
            valuesById.computeIfAbsent(keyId, k -> new ArrayList<>()).add(value);
        }

        return keys.stream()
                .map(key -> {
                    List<String> values = valuesById.getOrDefault(key.getId(), new ArrayList<>())
                            .stream().distinct().sorted().collect(Collectors.toList());
                    return new SpecFilterResponse(key.getId(), key.getName(), values);
                })
                .filter(response -> !response.getValues().isEmpty())
                .collect(Collectors.toList());
    }

    public List<SpecFilterResponse> getSpecFiltersBySearch(String query) {
        List<SpecKey> keys = specKeyRepository.searchSpecKeys(query);
        if (keys.isEmpty()) return new ArrayList<>();

        List<Object[]> rawValues = specValueRepository.findRawSpecsBySearch(query);
        
        Map<Integer, List<String>> valuesById = new HashMap<>();
        for (Object[] row : rawValues) {
            Integer keyId = (Integer) row[0];
            String value = (String) row[1];
            valuesById.computeIfAbsent(keyId, k -> new ArrayList<>()).add(value);
        }

        return keys.stream()
                .map(key -> {
                    List<String> values = valuesById.getOrDefault(key.getId(), new ArrayList<>())
                            .stream().distinct().sorted().collect(Collectors.toList());
                    return new SpecFilterResponse(key.getId(), key.getName(), values);
                })
                .filter(response -> !response.getValues().isEmpty())
                .collect(Collectors.toList());
    }

    public List<SpecFilterResponse> getAllSpecFilters() {
        List<SpecKey> keys = specKeyRepository.findAll();
        if (keys.isEmpty()) return new ArrayList<>();

        List<Object[]> rawValues = specValueRepository.findRawSpecsAll();
        
        Map<Integer, List<String>> valuesById = new HashMap<>();
        for (Object[] row : rawValues) {
            Integer keyId = (Integer) row[0];
            String value = (String) row[1];
            valuesById.computeIfAbsent(keyId, k -> new ArrayList<>()).add(value);
        }

        return keys.stream()
                .map(key -> {
                    List<String> values = valuesById.getOrDefault(key.getId(), new ArrayList<>())
                            .stream().distinct().sorted().collect(Collectors.toList());
                    return new SpecFilterResponse(key.getId(), key.getName(), values);
                })
                .filter(response -> !response.getValues().isEmpty())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSpecKey(Integer id) {
        if (!specKeyRepository.existsById(id)) {
            throw new RuntimeException("SpecKey not found with id: " + id);
        }
        specKeyRepository.deleteById(id);
    }
}
