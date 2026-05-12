# ─── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copie du pom.xml seul en premier pour mettre les dépendances en cache
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copie des sources et compilation sans les tests
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2 : Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring

# Volume persistant pour les fichiers uploadés
VOLUME /app/uploads

# Copie du JAR depuis l'étape de build
COPY --from=builder /app/target/wiki-0.0.1-SNAPSHOT.jar app.jar

    RUN chown spring:spring         app.jar
USER spring

EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]
