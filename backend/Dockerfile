# Use OpenJDK 24 for Java 24 support
FROM openjdk:24-jdk-slim

# Set working directory
WORKDIR /app

# Create tmp directory
RUN mkdir -p /app/tmp

# Copy Maven wrapper and pom.xml first (for better caching)
COPY .mvn .mvn
COPY mvnw pom.xml ./

# Make mvnw executable and download dependencies
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application with tmpdir
CMD ["java", "-jar", "-Djava.io.tmpdir=/app/tmp", "-Dspring.profiles.active=aws", "target/cosplaysuggestion-0.0.1-SNAPSHOT.jar"]
