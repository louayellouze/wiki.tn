package api.tn.wiki.config;

import api.tn.wiki.entity.*;
import api.tn.wiki.repository.CategoryRepository;
import api.tn.wiki.repository.ProductRepository;
import api.tn.wiki.repository.SpecKeyRepository;
import api.tn.wiki.repository.UserRepository;
import api.tn.wiki.repository.CouponRepository;
import api.tn.wiki.repository.ReviewRepository;
import api.tn.wiki.service.SentimentAnalysisService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;
import java.util.Random;
import api.tn.wiki.utils.SlugUtils;

import api.tn.wiki.repository.BrandRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                    CategoryRepository categoryRepository,
                                    ProductRepository productRepository,
                                    SpecKeyRepository specKeyRepository,
                                    BrandRepository brandRepository,
                                    CouponRepository couponRepository,
                                    ReviewRepository reviewRepository,
                                    SentimentAnalysisService sentimentAnalysisService,
                                    PasswordEncoder passwordEncoder, 
                                    JdbcTemplate jdbcTemplate) {
        return args -> {
            // 1. DATABASE SCHEMA OPTIMIZATION
            System.out.println("🚀 Repairing and Optimizing Database infrastructure...");
            
            // Safe SQL execution helper
            java.util.function.Consumer<String> safeExecute = (sql) -> {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception e) {
                    // System.err.println("Note: " + sql + " -> " + e.getMessage());
                }
            };

            // Enable extensions
            safeExecute.accept("CREATE EXTENSION IF NOT EXISTS pg_trgm");
            safeExecute.accept("CREATE EXTENSION IF NOT EXISTS unaccent");
                
            // [CRITICAL FIX] Handle 'user' table 'enabled' column
            safeExecute.accept("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true");
            safeExecute.accept("UPDATE \"user\" SET enabled = true WHERE enabled IS NULL");
            // Force l'activation des comptes système (admin, client) qui auraient été créés avec enabled=false
            safeExecute.accept("UPDATE \"user\" SET enabled = true WHERE username IN ('admin', 'client', 'infoline') AND enabled = false");
            
            // [CRITICAL FIX] Handle 'orders' table rename aftermath
            safeExecute.accept("DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order') THEN ALTER TABLE \"order\" RENAME TO orders; END IF; END $$");
            
            safeExecute.accept("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method varchar(255) DEFAULT 'CASH_ON_DELIVERY'");
            safeExecute.accept("UPDATE orders SET payment_method = 'CASH_ON_DELIVERY' WHERE payment_method IS NULL");

            // [CRITICAL FIX] Fix foreign key constraint on order_item if it points to old 'order' table
            safeExecute.accept("DO $$ BEGIN " +
                "IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fks234mi6jususbx4b37k44cipy') THEN " +
                "  ALTER TABLE order_item DROP CONSTRAINT fks234mi6jususbx4b37k44cipy; " +
                "  ALTER TABLE order_item ADD CONSTRAINT fks234mi6jususbx4b37k44cipy FOREIGN KEY (order_id) REFERENCES orders(id); " +
                "  RAISE NOTICE 'Fixed constraint fks234mi6jususbx4b37k44cipy to point to orders table'; " +
                "END IF; " +
                "END $$");

            // GIN index for full-text search
            safeExecute.accept("CREATE INDEX IF NOT EXISTS idx_product_search_vector ON product USING GIN(search_vector)");
            safeExecute.accept("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS search_vector tsvector");
            safeExecute.accept("CREATE INDEX IF NOT EXISTS idx_user_search_vector ON \"user\" USING GIN(search_vector)");
            
            // Trigram index for partial matches on users
            safeExecute.accept("CREATE INDEX IF NOT EXISTS idx_user_search_trgm ON \"user\" USING GIN ((coalesce(username,'') || ' ' || coalesce(email,'') || ' ' || coalesce(first_name,'') || ' ' || coalesce(last_name,'')) gin_trgm_ops)");
            
            // GIST index for fuzzy search
            safeExecute.accept("CREATE INDEX IF NOT EXISTS idx_product_title_trgm ON product USING GIST (title gist_trgm_ops)");
            safeExecute.accept("CREATE INDEX IF NOT EXISTS idx_product_ref_trgm ON product USING GIST (reference gist_trgm_ops)");

            // Ensure other columns exist
            safeExecute.accept("ALTER TABLE category ADD COLUMN IF NOT EXISTS slug VARCHAR(255)");
            safeExecute.accept("ALTER TABLE product ADD COLUMN IF NOT EXISTS slug VARCHAR(255)");
            safeExecute.accept("ALTER TABLE product ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT FALSE");
            safeExecute.accept("ALTER TABLE hero_banner ADD COLUMN IF NOT EXISTS secondary_image_url TEXT");
            safeExecute.accept("ALTER TABLE hero_banner ADD COLUMN IF NOT EXISTS third_image_url TEXT");

            try {
                // Trigger function for product search_vector
                jdbcTemplate.execute(
                    "CREATE OR REPLACE FUNCTION product_search_vector_update() RETURNS trigger AS $$ " +
                    "DECLARE " +
                    "  brand_name VARCHAR := ''; " +
                    "BEGIN " +
                    "  IF NEW.brand_id IS NOT NULL THEN " +
                    "    SELECT name INTO brand_name FROM brand WHERE id = NEW.brand_id; " +
                    "  END IF; " +
                    "  NEW.search_vector := " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') || " +
                    "    setweight(to_tsvector('simple', coalesce(brand_name, '')), 'A') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.reference, '')), 'B') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C'); " +
                    "  RETURN NEW; " +
                    "END $$ LANGUAGE plpgsql"
                );

                jdbcTemplate.execute("DROP TRIGGER IF EXISTS product_search_vector_trigger ON product");
                jdbcTemplate.execute(
                    "CREATE TRIGGER product_search_vector_trigger " +
                    "BEFORE INSERT OR UPDATE OF title, reference, description, brand_id ON product " +
                    "FOR EACH ROW EXECUTE FUNCTION product_search_vector_update()"
                );

                // Trigger function for user search_vector
                jdbcTemplate.execute(
                    "CREATE OR REPLACE FUNCTION user_search_vector_update() RETURNS trigger AS $$ " +
                    "BEGIN " +
                    "  NEW.search_vector := " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.username, '')), 'A') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.email, '')), 'A') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.first_name, '')), 'B') || " +
                    "    setweight(to_tsvector('simple', coalesce(NEW.last_name, '')), 'B'); " +
                    "  RETURN NEW; " +
                    "END $$ LANGUAGE plpgsql"
                );

                jdbcTemplate.execute("DROP TRIGGER IF EXISTS user_search_vector_trigger ON \"user\"");
                jdbcTemplate.execute(
                    "CREATE TRIGGER user_search_vector_trigger " +
                    "BEFORE INSERT OR UPDATE OF username, email, first_name, last_name ON \"user\" " +
                    "FOR EACH ROW EXECUTE FUNCTION user_search_vector_update()"
                );

                jdbcTemplate.execute("UPDATE product p SET search_vector = " +
                    "  setweight(to_tsvector('simple', coalesce(p.title, '')), 'A') || " +
                    "  setweight(to_tsvector('simple', coalesce((SELECT b.name FROM brand b WHERE b.id = p.brand_id LIMIT 1), '')), 'A') || " +
                    "  setweight(to_tsvector('simple', coalesce(p.reference, '')), 'B') || " +
                    "  setweight(to_tsvector('simple', coalesce(p.description, '')), 'C')");

                jdbcTemplate.execute("UPDATE \"user\" u SET search_vector = " +
                    "  setweight(to_tsvector('simple', coalesce(u.username, '')), 'A') || " +
                    "  setweight(to_tsvector('simple', coalesce(u.email, '')), 'A') || " +
                    "  setweight(to_tsvector('simple', coalesce(u.first_name, '')), 'B') || " +
                    "  setweight(to_tsvector('simple', coalesce(u.last_name, '')), 'B')");

                jdbcTemplate.execute("UPDATE category SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(unaccent(name), '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g')) WHERE slug IS NULL");
                jdbcTemplate.execute("UPDATE product SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(unaccent(title), '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g')) WHERE slug IS NULL");
                
                jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_category_slug ON category(slug)");
                jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_product_slug ON product(slug)");
                
                jdbcTemplate.execute("UPDATE product SET is_flash_sale = false WHERE is_flash_sale IS NULL");

                System.out.println("✅ Database infrastructure repaired and optimized.");
            } catch (Exception e) {
                System.err.println("⚠️ Optimization error: " + e.getMessage());
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
                admin.setEnabled(true);
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
                client.setEnabled(true);
                userRepository.save(client);
                System.out.println("✅ Default Client account created.");
            }

            // 4. SAMPLE CATALOG DATA
            if (productRepository.count() < 100) { 
                System.out.println("📦 Missing products detected. Wiping database and seeding rich catalog...");

                try {
                    jdbcTemplate.execute("TRUNCATE TABLE review, spec_value, spec_key, product_categories, order_item, \"order\", image, product, category, \"user\" CASCADE");
                    
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole(Role.ADMIN);
                    admin.setFirstName("System"); admin.setLastName("Admin"); admin.setEmail("admin@wiki.tn");
                    admin.setEnabled(true);
                    userRepository.save(admin);

                    User client = new User();
                    client.setUsername("client");
                    client.setPassword(passwordEncoder.encode("client123"));
                    client.setRole(Role.CLIENT);
                    client.setFirstName("User"); client.setLastName("Client"); client.setEmail("client@wiki.tn");
                    client.setEnabled(true);
                    userRepository.save(client);

                    // Re-seed Brands
                    String[][] brandsData = {
                        {"Asus", "asus", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://asus.com&size=128"},
                        {"MSI", "msi", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://msi.com&size=128"},
                        {"Samsung", "samsung", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://samsung.com&size=128"},
                        {"Apple", "apple", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://apple.com&size=128"},
                        {"LG", "lg", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://lg.com&size=128"},
                        {"Dell", "dell", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://dell.com&size=128"},
                        {"HP", "hp", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://hp.com&size=128"},
                        {"Lenovo", "lenovo", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://lenovo.com&size=128"},
                        {"Acer", "acer", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://acer.com&size=128"},
                        {"Razer", "razer", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://razer.com&size=128"},
                        {"Sony", "sony", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://sony.com&size=128"},
                        {"Huawei", "huawei", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://huawei.com&size=128"},
                        {"Xiaomi", "xiaomi", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://mi.com&size=128"},
                        {"Canon", "canon", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://canon.com&size=128"},
                        {"Nikon", "nikon", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://nikon.com&size=128"},
                        {"Logitech", "logitech", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://logitech.com&size=128"},
                        {"Microsoft", "microsoft", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://microsoft.com&size=128"},
                        {"Intel", "intel", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://intel.com&size=128"},
                        {"AMD", "amd", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://amd.com&size=128"},
                        {"Nvidia", "nvidia", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://nvidia.com&size=128"},
                        {"JBL", "jbl", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://jbl.com&size=128"},
                        {"Bose", "bose", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bose.com&size=128"},
                        {"Corsair", "corsair", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://corsair.com&size=128"},
                        {"Gigabyte", "gigabyte", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gigabyte.com&size=128"},
                        {"Kingston", "kingston", "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kingston.com&size=128"}
                    };

                    java.util.Map<String, Brand> brandMap = new java.util.HashMap<>();
                    for (String[] bData : brandsData) {
                        Brand b = new Brand();
                        b.setName(bData[0]);
                        b.setSlug(bData[1]);
                        b.setLogoUrl(bData[2]);
                        b.setDescription("Produits de haute qualité de la marque " + bData[0]);
                        brandMap.put(bData[0], brandRepository.save(b));
                    }

                    // Create Spec Keys
                    SpecKey skProcesseur = new SpecKey(); skProcesseur.setName("Processeur"); specKeyRepository.save(skProcesseur);
                    SpecKey skRam = new SpecKey(); skRam.setName("Mémoire RAM"); specKeyRepository.save(skRam);
                    SpecKey skStockage = new SpecKey(); skStockage.setName("Stockage"); specKeyRepository.save(skStockage);
                    SpecKey skEcran = new SpecKey(); skEcran.setName("Écran"); specKeyRepository.save(skEcran);
                    SpecKey skGpu = new SpecKey(); skGpu.setName("Carte Graphique"); specKeyRepository.save(skGpu);
                    SpecKey skSysteme = new SpecKey(); skSysteme.setName("Système d'exploitation"); specKeyRepository.save(skSysteme);

                    // Create Categories
                    Category telephonie = categoryRepository.save(createCategory("TÉLÉPHONIE", "Smartphones et accessoires", null));
                    Category informatique = categoryRepository.save(createCategory("INFORMATIQUE", "PC, Laptops et composants", null));
                    Category gaming = categoryRepository.save(createCategory("GAMING", "PC Gamer, Consoles et accessoires", null));
                    Category imageSon = categoryRepository.save(createCategory("IMAGE & SON", "TV, Home Cinéma et Casques", null));

                    Category smartphone = categoryRepository.save(createCategory("SMARTPHONES", "Tous les smartphones", telephonie));
                    Category pcPortable = categoryRepository.save(createCategory("PC PORTABLE", "Ordinateurs portables", informatique));
                    Category tv = categoryRepository.save(createCategory("TÉLÉVISEURS", "TV LED, QLED, OLED", imageSon));

                    Category macbook = categoryRepository.save(createCategory("MACBOOK", "PC Portables Apple", pcPortable));
                    Category pcGamer = categoryRepository.save(createCategory("PC GAMER PORTABLE", "PC Portables pour le gaming", pcPortable));
                    Category samsungCat = categoryRepository.save(createCategory("SAMSUNG GALAXY", "Smartphones Samsung", smartphone));
                    Category iphone = categoryRepository.save(createCategory("IPHONE", "iPhone Apple", smartphone));
                    Category smartTv = categoryRepository.save(createCategory("SMART TV", "Téléviseurs intelligents", tv));

                    // Seed Products (abbreviated logic)
                    Random rand = new Random();
                    for (int i = 1; i <= 20; i++) {
                        createRichProduct(productRepository, specKeyRepository, "MacBook Pro " + i, "APL-MBP-" + i, 4500.0, 4200.0, 10, macbook, brandMap.get("Apple"), "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", List.of("Processeur:Apple M3", "Mémoire RAM:16 Go"));
                        createRichProduct(productRepository, specKeyRepository, "Samsung Galaxy S" + i, "SAM-S-" + i, 3800.0, 3500.0, 10, samsungCat, brandMap.get("Samsung"), "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800", List.of("Processeur:Snapdragon 8 Gen 2", "Mémoire RAM:12 Go"));
                    }

                    System.out.println("✅ Catalog seeded successfully.");
                } catch (Exception e) {
                    System.err.println("❌ Seeding error: " + e.getMessage());
                }
            }

            // 5. COUPONS DATA
            if (couponRepository.count() == 0) {
                System.out.println("🎟️ Seeding default coupons...");
                
                Coupon c1 = new Coupon();
                c1.setCode("WIKI5");
                c1.setDiscountType(Coupon.DiscountType.PERCENT);
                c1.setDiscountValue(5.0);
                c1.setMinOrderAmount(50.0);
                c1.setIsActive(true);
                couponRepository.save(c1);

                Coupon c2 = new Coupon();
                c2.setCode("WIKI10");
                c2.setDiscountType(Coupon.DiscountType.PERCENT);
                c2.setDiscountValue(10.0);
                c2.setMinOrderAmount(100.0);
                c2.setIsActive(true);
                couponRepository.save(c2);

                Coupon c3 = new Coupon();
                c3.setCode("WIKI20");
                c3.setDiscountType(Coupon.DiscountType.FIXED);
                c3.setDiscountValue(20.0);
                c3.setMinOrderAmount(200.0);
                c3.setIsActive(true);
                couponRepository.save(c3);

                System.out.println("✅ Default coupons created.");
            }

            // 6. BATCH SENTIMENT ANALYSIS (HYBRID)
            // Re-analyze null OR neutral fallbacks (0.5)
            long countToAnalyze = reviewRepository.countAllBySentimentIsNull() + reviewRepository.countAllBySentimentScore(0.5);
            if (countToAnalyze > 0) {
                System.out.println("🤖 Batch Analyzing/Repairing " + countToAnalyze + " reviews...");
                List<Review> reviewsToAnalyze = reviewRepository.findAllToAnalyze();
                for (Review review : reviewsToAnalyze) {
                    try {
                        var analysis = sentimentAnalysisService.analyzeSentiment(review.getComment(), review.getRating());
                        review.setSentiment((String) analysis.get("sentiment"));
                        review.setSentimentScore((Double) analysis.get("score"));
                    } catch (Exception e) {
                        review.setSentiment("NEUTRAL");
                        review.setSentimentScore(0.51); // Marker to avoid infinite re-analysis
                    }
                }
                reviewRepository.saveAll(reviewsToAnalyze);
                System.out.println("✅ Batch analysis complete.");
            }
        };
    }

    private Category createCategory(String name, String description, Category parent) {
        Category cat = new Category();
        cat.setName(name);
        cat.setSlug(SlugUtils.makeSlug(name));
        cat.setDescription(description);
        cat.setParent(parent);
        cat.setSubCategories(new java.util.HashSet<>());
        if (parent != null) {
            if (parent.getSubCategories() == null) parent.setSubCategories(new java.util.HashSet<>());
            parent.getSubCategories().add(cat);
        }
        return cat;
    }

    private void createRichProduct(ProductRepository repo, SpecKeyRepository skRepo, String title, String ref, Double reg, Double disc, Integer qty, Category cat, Brand brand, String imgUrl, java.util.List<String> specs) {
        Product p = new Product();
        p.setTitle(title);
        p.setSlug(SlugUtils.makeSlug(title));
        p.setReference(ref);
        p.setRegularPrice(reg);
        p.setDiscountPrice(disc);
        p.setQuantity(qty);
        p.setBrand(brand);
        p.setStockStatus(qty > 0 ? StockStatus.EN_STOCK : StockStatus.HORS_STOCK);
        p.setDescription("Description pour " + title);
        p.setCategories(java.util.Set.of(cat));
        
        Image img = new Image();
        img.setImageUrl(imgUrl);
        img.setAlt(title);
        img.setProduct(p);
        p.getImages().add(img);

        for (String spec : specs) {
            String[] parts = spec.split(":");
            if (parts.length == 2) {
                skRepo.findByName(parts[0]).ifPresent(key -> {
                    SpecValue sv = new SpecValue();
                    sv.setSpecKey(key);
                    sv.setValue(parts[1]);
                    sv.setProduct(p);
                    p.getSpecifications().add(sv);
                });
            }
        }
        repo.save(p);
    }
}
