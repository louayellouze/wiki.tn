package api.tn.wiki.config;

import api.tn.wiki.entity.*;
import api.tn.wiki.repository.CategoryRepository;
import api.tn.wiki.repository.ProductRepository;
import api.tn.wiki.repository.SpecKeyRepository;
import api.tn.wiki.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;
import java.util.Random;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                    CategoryRepository categoryRepository,
                                    ProductRepository productRepository,
                                    SpecKeyRepository specKeyRepository,
                                    PasswordEncoder passwordEncoder, 
                                    JdbcTemplate jdbcTemplate) {
        return args -> {
            // 1. DATABASE SCHEMA OPTIMIZATION (Full-Text Search & Fuzzy Search)
            try {
                System.out.println("🚀 Optimizing Database infrastructure...");
                
                // Enable pg_trgm for typo tolerance
                jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm");
                    
                // GIN index for full-text search
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_product_search_vector ON product USING GIN(search_vector)");
                
                // GIST index for fuzzy search (trigram similarity)
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_product_title_trgm ON product USING GIST (title gist_trgm_ops)");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_product_ref_trgm ON product USING GIST (reference gist_trgm_ops)");

                // Trigger function for search_vector
                jdbcTemplate.execute(
                    "CREATE OR REPLACE FUNCTION product_search_vector_update() RETURNS trigger AS $$ " +
                    "BEGIN " +
                    "  NEW.search_vector := " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.reference, '')), 'B') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C'); " +
                    "  RETURN NEW; " +
                    "END $$ LANGUAGE plpgsql"
                );

                jdbcTemplate.execute("DROP TRIGGER IF EXISTS product_search_vector_trigger ON product");
                jdbcTemplate.execute(
                    "CREATE TRIGGER product_search_vector_trigger " +
                    "BEFORE INSERT OR UPDATE OF title, reference, description ON product " +
                    "FOR EACH ROW EXECUTE FUNCTION product_search_vector_update()"
                );

                jdbcTemplate.execute(
                    "UPDATE product SET search_vector = " +
                    "  setweight(to_tsvector('simple', coalesce(title, '')), 'A') || " +
                    "  setweight(to_tsvector('simple', coalesce(reference, '')), 'B') || " +
                    "  setweight(to_tsvector('simple', coalesce(description, '')), 'C') " +
                    "WHERE search_vector IS NULL"
                );
                
                System.out.println("✅ Database infrastructure ready.");
            } catch (Exception e) {
                System.err.println("⚠️ Initialization error: " + e.getMessage());
            }

            // 2. CLEANUP
            try {
                jdbcTemplate.execute("ALTER TABLE historique DROP CONSTRAINT IF EXISTS historique_entity_type_check");
            } catch (Exception e) {}

            // 3. SECURITY DATA
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setLastName("Admin");
                admin.setFirstName("System");
                admin.setEmail("admin@wiki.tn");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Default Admin account created.");
            }

            if (userRepository.findByUsername("client").isEmpty()) {
                User client = new User();
                client.setUsername("client");
                client.setPassword(passwordEncoder.encode("client123"));
                client.setLastName("Client");
                client.setFirstName("User");
                client.setEmail("client@wiki.tn");
                client.setRole(Role.CLIENT);
                userRepository.save(client);
                System.out.println("✅ Default Client account created.");
            }

            // 4. SAMPLE CATALOG DATA
            // We use a strictly named category to detect if the new catalog is present.
            // If "SMARTPHONES" is missing, we wipe EVERYTHING and seed.
            if (categoryRepository.findByName("SMARTPHONES").isEmpty()) { 
                System.out.println("� Wiping database and seeding rich catalog...");

                try {
                    // Native TRUNCATE CASCADE is the most reliable way to clear a Postgres DB during dev
                    jdbcTemplate.execute("TRUNCATE TABLE review, spec_value, spec_key, product_categories, order_item, orders, image, product, category, users CASCADE");
                    System.out.println("✅ All tables truncated (CASCADE).");
                    
                    // Re-seed admin accounts since we truncated 'users'
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole(Role.ADMIN);
                    admin.setFirstName("System"); admin.setLastName("Admin"); admin.setEmail("admin@wiki.tn");
                    userRepository.save(admin);
                } catch (Exception e) {
                    System.err.println("⚠️ Aggressive clear failed, falling back to soft delete: " + e.getMessage());
                }

                // Create Spec Keys
                SpecKey skProcesseur = new SpecKey(); skProcesseur.setName("Processeur"); specKeyRepository.save(skProcesseur);
                SpecKey skRam = new SpecKey(); skRam.setName("Mémoire RAM"); specKeyRepository.save(skRam);
                SpecKey skStockage = new SpecKey(); skStockage.setName("Stockage"); specKeyRepository.save(skStockage);
                SpecKey skEcran = new SpecKey(); skEcran.setName("Écran"); specKeyRepository.save(skEcran);
                SpecKey skGpu = new SpecKey(); skGpu.setName("Carte Graphique"); specKeyRepository.save(skGpu);
                SpecKey skSysteme = new SpecKey(); skSysteme.setName("Système d'exploitation"); specKeyRepository.save(skSysteme);

                // Create Parent Categories
                Category telephonie = categoryRepository.save(createCategory("TÉLÉPHONIE", "Smartphones et accessoires", null));
                Category informatique = categoryRepository.save(createCategory("INFORMATIQUE", "PC, Laptops et composants", null));
                Category gaming = categoryRepository.save(createCategory("GAMING", "PC Gamer, Consoles et accessoires", null));
                Category imageSon = categoryRepository.save(createCategory("IMAGE & SON", "TV, Home Cinéma et Casques", null));

                // Create Level 1 Sub-Categories
                Category smartphone = categoryRepository.save(createCategory("SMARTPHONES", "Tous les smartphones", telephonie));
                Category pcPortable = categoryRepository.save(createCategory("PC PORTABLE", "Ordinateurs portables", informatique));
                Category tv = categoryRepository.save(createCategory("TÉLÉVISEURS", "TV LED, QLED, OLED", imageSon));

                // Create Level 2 Sub-Categories
                Category macbook = categoryRepository.save(createCategory("MACBOOK", "PC Portables Apple", pcPortable));
                Category pcGamer = categoryRepository.save(createCategory("PC GAMER PORTABLE", "PC Portables pour le gaming", pcPortable));
                Category samsung = categoryRepository.save(createCategory("SAMSUNG GALAXY", "Smartphones Samsung", smartphone));
                Category iphone = categoryRepository.save(createCategory("IPHONE", "iPhone Apple", smartphone));

                // Generate Rich Product Catalog
                Random rand = new Random();
                int productCount = 0;

                // --- DATA SEEDING LOGIC ---
                // Macbooks
                for (int i = 1; i <= 8; i++) {
                    createRichProduct(productRepository, specKeyRepository, 
                        "MacBook Pro " + (13 + (i%2)) + "\" M3 " + (i%2==0 ? "Max" : "Pro"), 
                        "APL-MBP-" + (100+i), 4500.0 + (rand.nextInt(1000)), 4200.0 + (rand.nextInt(500)), 15, macbook, 
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                        List.of("Processeur:Apple M3 " + (i%2==0 ? "Max" : "Pro"), "Mémoire RAM:" + (16*(1+(i%3))) + " Go", "Stockage:512 Go SSD", "Écran:Liquid Retina XDR", "Système d'exploitation:macOS"));
                    productCount++;
                }

                // PC Gamer Portable
                for (int i = 1; i <= 10; i++) {
                    String brand = (i % 2 == 0) ? "Asus ROG" : "MSI Katana";
                    createRichProduct(productRepository, specKeyRepository, 
                        brand + " Strix G" + (15+i), "GAM-LAP-" + (200+i), 3200.0 + (rand.nextInt(800)), 2900.0 + (rand.nextInt(600)), 10, pcGamer, 
                        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800",
                        List.of("Processeur:Intel Core i7-13700H", "Mémoire RAM:16 Go DDR5", "Stockage:1 To SSD NVMe", "Écran:144Hz Full HD", "Carte Graphique:NVIDIA RTX 4060", "Système d'exploitation:Windows 11"));
                    productCount++;
                }

                // Samsung
                for (int i = 1; i <= 10; i++) {
                    createRichProduct(productRepository, specKeyRepository, 
                        "Samsung Galaxy S24 Ultra " + i, "SAM-S24-" + i, 3800.0 + (rand.nextInt(400)), 3500.0 + (rand.nextInt(300)), 20, samsung, 
                        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
                        List.of("Processeur:Snapdragon 8 Gen 3", "Mémoire RAM:12 Go", "Stockage:256 Go", "Écran:Dynamic AMOLED 2X", "Système d'exploitation:Android 14"));
                    productCount++;
                }

                // iPhone
                for (int i = 1; i <= 10; i++) {
                    createRichProduct(productRepository, specKeyRepository, 
                        "iPhone 15 Pro Max " + i, "APL-IP15-" + i, 4500.0 + (rand.nextInt(500)), 4200.0 + (rand.nextInt(400)), 20, iphone, 
                        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
                        List.of("Processeur:A17 Pro", "Mémoire RAM:8 Go", "Stockage:256 Go", "Écran:Super Retina XDR", "Système d'exploitation:iOS 17"));
                    productCount++;
                }

                System.out.println("✅ " + productCount + " detailed sample products created.");
            }
        };
    }

    private Category createCategory(String name, String description, Category parent) {
        Category cat = new Category();
        cat.setName(name);
        cat.setDescription(description);
        cat.setParent(parent);
        cat.setSubCategories(new java.util.HashSet<>());
        if (parent != null) {
            if (parent.getSubCategories() == null) {
                parent.setSubCategories(new java.util.HashSet<>());
            }
            parent.getSubCategories().add(cat);
        }
        return cat;
    }

    private void createRichProduct(ProductRepository repo, SpecKeyRepository skRepo, String title, String ref, Double reg, Double disc, Integer qty, Category cat, String imgUrl, java.util.List<String> specs) {
        Product p = new Product();
        p.setTitle(title);
        p.setReference(ref);
        p.setRegularPrice(reg);
        p.setDiscountPrice(disc);
        p.setQuantity(qty);
        p.setStockStatus(qty > 0 ? StockStatus.EN_STOCK : StockStatus.HORS_STOCK);
        p.setDescription("Un excellent produit de la catégorie " + cat.getName() + ". Performance garantie.");
        p.setCategories(java.util.Set.of(cat));
        
        Image img = new Image();
        img.setImageUrl(imgUrl);
        img.setAlt(title);
        img.setProduct(p);
        p.getImages().add(img);

        for (String spec : specs) {
            String[] parts = spec.split(":");
            if (parts.length == 2) {
                String keyName = parts[0];
                String value = parts[1];
                skRepo.findByName(keyName).ifPresent(key -> {
                    SpecValue sv = new SpecValue();
                    sv.setSpecKey(key);
                    sv.setValue(value);
                    sv.setProduct(p);
                    p.getSpecifications().add(sv);
                });
            }
        }
        repo.save(p);
    }
}
