# Build stage
FROM openjdk:17-jdk-slim as build

WORKDIR /app

# Copy gradle files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src

# Make gradlew executable
RUN chmod +x gradlew

# Build application
RUN ./gradlew bootJar

# Runtime stage
FROM openjdk:17-jdk-slim

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
