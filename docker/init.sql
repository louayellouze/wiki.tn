-- =============================================================================
-- Wiki.tn — PostgreSQL Init Script
-- Exécuté automatiquement par le conteneur postgres au premier démarrage
-- (uniquement si le volume postgres_data est vide / nouvelle installation)
-- =============================================================================

-- Extensions nécessaires à l'application
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- nécessaire pour crypt() / BCrypt

-- =============================================================================
-- Table "user"
-- Créée ici pour que l'admin puisse être inséré AVANT le démarrage de Spring Boot.
-- Hibernate (ddl-auto=update) vérifiera et complétera le schéma au démarrage.
-- =============================================================================
CREATE TABLE IF NOT EXISTS "user" (
    id                    SERIAL PRIMARY KEY,
    username              VARCHAR(255) UNIQUE NOT NULL,
    password              VARCHAR(255),
    first_name            VARCHAR(255),
    last_name             VARCHAR(255),
    address               VARCHAR(255),
    phone                 VARCHAR(255),
    email                 VARCHAR(255) UNIQUE NOT NULL,
    reset_password_token  VARCHAR(255),
    verification_token    VARCHAR(255),
    image_url             VARCHAR(1000000),
    role                  VARCHAR(50),
    enabled               BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================================
-- Compte Admin par défaut
-- Mot de passe : admin123 (hashé avec BCrypt cost 10 via pgcrypto)
-- Compatible avec Spring Security BCryptPasswordEncoder
-- ON CONFLICT DO NOTHING → idempotent, ne plante pas si déjà créé
-- =============================================================================
INSERT INTO "user" (username, password, first_name, last_name, email, role, enabled)
VALUES (
    'admin',
    crypt('admin123', gen_salt('bf', 10)),
    'System',
    'Admin',
    'admin@wiki.tn',
    'ADMIN',
    TRUE
) ON CONFLICT (username) DO NOTHING;
