package api.tn.wiki.config;

import api.tn.wiki.entity.RepairItem;
import api.tn.wiki.entity.RepairSection;
import api.tn.wiki.repository.RepairItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Arrays;

@Configuration
public class RepairDataInitializer {

    @Bean
    CommandLineRunner initRepairData(RepairItemRepository repository, JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE repair_items DROP CONSTRAINT IF EXISTS repair_items_section_check");
                // Ensure payment_method column exists in orders table
                jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method varchar(255) DEFAULT 'CASH_ON_DELIVERY'");
                // Ensure enabled column exists in "user" table
                jdbcTemplate.execute("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true");
            } catch (Exception e) {
                System.out.println("DB Initialization warning: " + e.getMessage());
            }
            if (repository.count() > 0) {
                return;
            }

            // 1. HERO
            repository.save(new RepairItem(RepairSection.HERO, "Votre Centre De Maintenance Et De Réparation Informatique Et Électronique", "Bienvenue Chez Wiki Repair", "Wiki Repair lance un service professionnel dédié à la réparation et à la maintenance des équipements informatiques et électroniques, destiné aux particuliers comme aux entreprises.", "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=1000", "/img/wiki-repair-logo.png", null, null, 0, true));

            // 2. ABOUT
            repository.save(new RepairItem(RepairSection.ABOUT, "Qu'est-ce que WIKI Repair", null, "Wiki Repair, c'est votre espace dédié à la remise en forme de vos appareils numériques: diagnostic, nettoyage, réparation, montage, récupération de données... même si vous ne les avez pas achetés chez nous ! Notre mission : prolonger la durée de vie de vos appareils tout en vous offrant un service rapide, fiable et transparent.", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000", null, null, null, 0, true));

            // 3. CERTIFICATIONS
            repository.save(new RepairItem(RepairSection.CERTIFICATION, "ISO 9001", null, null, null, null, null, null, 0, true));
            repository.save(new RepairItem(RepairSection.CERTIFICATION, "ISO 14001", null, null, null, null, null, null, 1, true));
            repository.save(new RepairItem(RepairSection.CERTIFICATION, "IEC 62368-1", null, null, null, null, null, null, 2, true));
            repository.save(new RepairItem(RepairSection.CERTIFICATION, "Formations Des Techniciens", null, null, null, null, null, null, 3, true));

            // 4. SERVICES
            repository.save(new RepairItem(RepairSection.SERVICE, "Reparation Rapide (moins 1h)", null, "Remplacement d'écrans de smartphones et tablettes. Nettoyage de PC et optimisation des performances. Réparation de chargeurs et câbles.", null, null, "Zap", null, 0, true));
            repository.save(new RepairItem(RepairSection.SERVICE, "Réparation Standard (24h-48h)", null, "Remplacement de cartes mères, composants électroniques. Réparation de téléviseurs, amplificateurs, enceintes. Remise en état de petits électroménagers.", null, null, "Clock", null, 1, true));
            repository.save(new RepairItem(RepairSection.SERVICE, "Recyclage et échange Standard", null, "Programme de reprise des appareils hors d'usage contre des produits reconditionnés. Mise en place d'un service de recyclage des composants.", null, null, "RefreshCw", null, 2, true));
            repository.save(new RepairItem(RepairSection.SERVICE, "Contrats de Maintenance et Offres B2B", null, "Offres adaptés pour la maintenance de parcs informatique dans les entreprises. Contrats d'entretien pour particuliers garantissant des suivis réguliers.", null, null, "Briefcase", null, 3, true));

            // 5. DEVICES
            repository.save(new RepairItem(RepairSection.DEVICE, "Smartphone", null, null, null, null, "Smartphone", null, 0, true));
            repository.save(new RepairItem(RepairSection.DEVICE, "Tablette", null, null, null, null, "Tablet", null, 1, true));
            repository.save(new RepairItem(RepairSection.DEVICE, "Ordinateur De Bureau", null, null, null, null, "Monitor", null, 2, true));
            repository.save(new RepairItem(RepairSection.DEVICE, "Ordinateur Portable", null, null, null, null, "Laptop", null, 3, true));
            repository.save(new RepairItem(RepairSection.DEVICE, "Serveur", null, null, null, null, "Server", null, 4, true));
            repository.save(new RepairItem(RepairSection.DEVICE, "Hifi", null, null, null, null, "Speaker", null, 5, true));

            // 6. DIAGNOSIS TABS
            repository.save(new RepairItem(RepairSection.DIAGNOSIS, "Écran & Vitre", null, "Le problème le plus fréquent, résolu généralement en moins de 30 minutes par nos experts.", null, null, null, null, 0, true));
            repository.save(new RepairItem(RepairSection.DIAGNOSIS, "Batterie & Autonomie", null, "Retrouvez l'autonomie d'origine pour une utilisation sans contrainte toute la journée.", null, null, null, null, 1, true));
            repository.save(new RepairItem(RepairSection.DIAGNOSIS, "Diagnostic Complet", null, "Une analyse approfondie sur 25 points de contrôle pour détecter les pannes cachées.", null, null, null, null, 2, true));

            // 7. PRICE CARDS
            repository.save(new RepairItem(RepairSection.PRICE_CARD, "Vitre Tactile uniquement", "Écran & Vitre", "Pour les fissures superficielles sans taches noires.", null, null, null, 59.0, 0, true));
            repository.save(new RepairItem(RepairSection.PRICE_CARD, "Bloc Écran OLED Original", "Écran & Vitre", "Remplacement complet par une pièce constructeur.", null, null, null, 189.0, 1, true));

            // 8. OBJECTIVES
            repository.save(new RepairItem(RepairSection.OBJECTIVE, "Rapidité Extrême", null, "Diagnostic gratuit et réparation express en moins de 45 minutes.", null, null, "Zap", null, 0, true));
            repository.save(new RepairItem(RepairSection.OBJECTIVE, "Transparence Totale", null, "Devis gratuit avant chaque intervention, sans frais cachés.", null, null, "ShieldCheck", null, 1, true));
            repository.save(new RepairItem(RepairSection.OBJECTIVE, "Garantie de 6 Mois", null, "Toutes nos interventions sont couvertes par une garantie nationale.", null, null, "Clock", null, 2, true));

            // 9. PROCESS
            repository.save(new RepairItem(RepairSection.PROCESS, "Diagnostic Gratuit", null, "Analyse complète sans engagement sous 15 minutes.", null, null, "Search", null, 0, true));
            repository.save(new RepairItem(RepairSection.PROCESS, "Réparation", null, "Intervention immédiate avec des pièces d'origine.", null, null, "Wrench", null, 1, true));
            repository.save(new RepairItem(RepairSection.PROCESS, "Restitution", null, "Tests de contrôle rigoureux avant remise en main propre.", null, null, "Smartphone", null, 2, true));
        };
    }
}
