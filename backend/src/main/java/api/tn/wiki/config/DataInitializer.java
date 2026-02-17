package api.tn.wiki.config;

import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            // Fix: Drop problematic constraint on Historique table if it exists
            try {
                jdbcTemplate.execute("ALTER TABLE historique DROP CONSTRAINT IF EXISTS historique_entity_type_check");
                System.out.println("Cleaned up Historique constraints.");
            } catch (Exception e) {
                System.out.println("Constraint cleanup skipped: " + e.getMessage());
            }

            // Create Admin account if it doesn't exist
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setLastName("Admin");
                admin.setFirstName("System");
                admin.setEmail("admin@wiki.tn");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Admin account created: admin / admin123");
            }

            // Create Client account if it doesn't exist
            if (userRepository.findByUsername("client").isEmpty()) {
                User client = new User();
                client.setUsername("client");
                client.setPassword(passwordEncoder.encode("client123"));
                client.setLastName("Client");
                client.setFirstName("User");
                client.setEmail("client@wiki.tn");
                client.setRole(Role.CLIENT);
                userRepository.save(client);
                System.out.println("Client account created: client / client123");
            }
        };
    }
}
