# Build and run Gift Mart API on Render (or any Docker host)
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/target/gift-mart-api-1.0.0.jar app.jar
# Render injects PORT; application.properties uses server.port=${PORT:5000}
ENV PORT=5000
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
