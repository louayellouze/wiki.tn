package api.tn.wiki.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseConfig {

    @Bean
    public CommandLineRunner fixOrderStatusConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Drop the existing constraint that restricts enum values
                jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
                System.out.println("✅ Database constraint 'orders_status_check' dropped successfully.");
            } catch (Exception e) {
                System.err.println("⚠️ Could not drop constraint: " + e.getMessage());
            }
        };
    }
}
