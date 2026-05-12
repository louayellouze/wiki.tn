package api.tn.wiki.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SearchOptimizer {
    @Bean
    public CommandLineRunner setupTrigrams(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("🔧 Verifying Search Extensions...");
                jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_product_title_trgm ON product USING GIST (title gist_trgm_ops)");
                System.out.println("✅ Search Extensions Verified.");
            } catch (Exception e) {
                System.err.println("❌ Setup error: " + e.getMessage());
            }
        };
    }
}
