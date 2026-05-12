package api.tn.wiki.controller;

import api.tn.wiki.dto.request.ProductRequest;
import api.tn.wiki.dto.response.ProductMinResponse;
import api.tn.wiki.dto.response.ProductResponse;
import api.tn.wiki.dto.response.ProductSearchDto;
import api.tn.wiki.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) Boolean isFlashSale,
            @RequestParam(defaultValue = "id,desc") String sort) {
        try {
            if (page != null && size != null) {
                String[] sortParts = sort.split(",");
                Sort sorting = Sort.by(sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? 
                        Sort.Direction.ASC : Sort.Direction.DESC, sortParts[0]);
                Pageable pageable = PageRequest.of(page, size, sorting);

                if (search != null && !search.trim().isEmpty()) {
                    Pageable searchPageable = PageRequest.of(page, size); 
                    return ResponseEntity.ok(productService.searchProducts(search, categoryId, stockStatus, isFlashSale, searchPageable));
                }
                
                return ResponseEntity.ok(productService.getAllProducts(categoryId, stockStatus, isFlashSale, pageable));
            }
            return ResponseEntity.ok(productService.getAllProducts());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/flash-sale")
    public ResponseEntity<?> getFlashSaleProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        try {
            if (page != null && size != null) {
                Pageable pageable = PageRequest.of(page, size);
                return ResponseEntity.ok(productService.getFlashSaleProducts(pageable));
            }
            return ResponseEntity.ok(productService.getFlashSaleProducts());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        try {
            if (page != null && size != null) {
                Pageable pageable = PageRequest.of(page, size);
                return ResponseEntity.ok(productService.searchProducts(q, null, null, null, pageable));
            }
            return ResponseEntity.ok(productService.searchProducts(q, null, null, null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/search/autocomplete")
    public ResponseEntity<List<ProductSearchDto>> searchAutocomplete(@RequestParam String q) {
        try {
            if (q == null || q.trim().length() < 2) return ResponseEntity.ok(List.of());
            return ResponseEntity.ok(productService.searchProductsAutocomplete(q.trim()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        try {
            if (page != null && size != null) {
                Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
                return ResponseEntity.ok(productService.getProductsByCategory(categoryId, pageable));
            }
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> getFilteredProducts(
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam Map<String, String> allParams) {
        
        try {
            Map<String, List<String>> filters = new HashMap<>();
            for (Map.Entry<String, String> entry : allParams.entrySet()) {
                String key = entry.getKey();
                if (!key.equals("categorySlug") && !key.equals("brandSlug") && !key.equals("minPrice") && !key.equals("maxPrice") && 
                    !key.equals("page") && !key.equals("size") && !key.equals("sort")) {
                    filters.put(key, java.util.Arrays.asList(entry.getValue().split(",")));
                }
            }

            String[] sortParts = sort.split(",");
            Sort sorting = Sort.by(sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortParts[0]);
            Pageable pageable = PageRequest.of(page, size, sorting);

            Page<ProductResponse> products = productService.getFilteredProducts(categorySlug, brandSlug, filters, minPrice, maxPrice, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WEBMASTER', 'ROLE_INFOLINE')")
    public ResponseEntity<?> getLowStockProducts(@RequestParam(defaultValue = "5") int threshold) {
        try {
            return ResponseEntity.ok(productService.getLowStockProducts(threshold));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving low stock products");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Integer id) {
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving product");
        }
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        try {
            ProductResponse product = productService.getProductBySlug(slug);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving product");
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.createProduct(request);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WEBMASTER')")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.updateProduct(id, request);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting product: " + e.getMessage());
        }
    }

    @PostMapping("/regenerate-slugs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> regenerateSlugs() {
        try {
            productService.regenerateAllSlugs();
            return ResponseEntity.ok("All product slugs have been regenerated successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error regenerating slugs: " + e.getMessage());
        }
    }
}
