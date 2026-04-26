# Gift Mart API – Java (Spring Boot)

This is the **Java backend** for Gift Mart. It uses the **same MongoDB database** as the Node.js backend, so you can switch between Node and Java without changing data.

## Requirements

- **Java 17+**
- **Maven 3.6+**
- **MongoDB** (local or Atlas)

## Quick start

### 1. Configure environment

Create `src/main/resources/application-local.properties` (optional), or set environment variables. A full list of variable names is in **`.env.example`** (repo root: `backend-java/.env.example`) — Spring does not load `.env` automatically; use exported env vars, Render, or Docker.

- `MONGODB_URI` – MongoDB connection (default: `mongodb://localhost:27017/gift-mart`)
- `JWT_SECRET` – Secret for JWT (use a long random string in production)
- `FRONTEND_URL` – Frontend origin for CORS (default: `http://localhost:3000`)
- `SPRING_PROFILES_ACTIVE` – `dev` (default) or `prod` (see `application-prod.properties`)

Monorepo docs: **`README.md`** and **`SPRINT_4_PLAN.md`** at the repository root.

### 2. Run the application

```bash
cd backend-java
mvn spring-boot:run
```

The API runs at **http://localhost:5000**. On first run, it creates an admin user, default categories, and sample products **only if those collections are empty**. Restarting the backend does **not** wipe admin changes to products or categories — data lives in MongoDB until you change it there or drop the database.

### 3. Use with the React frontend

Point the frontend to **http://localhost:5000** (same as the Node backend). The API paths and JSON format match the Node version:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/PUT /api/users/profile`, `GET /api/users/orders`, reminders, suggestions
- `GET /api/products`, `GET /api/products/categories`, `GET /api/products/:id`
- `GET /api/search?q=...`
- `POST /api/orders` (supports COD & card payment), `GET /api/orders/:id`
- `GET /api/reviews/product/:id`, `POST /api/reviews`, `GET /api/reviews/product/:id/mine`
- `GET/POST/PUT/DELETE /api/admin/*` (admin only)
- `PUT /api/admin/orders/:id/payment-status` (update payment status)

**Default admin:** `admin@giftmart.com` / `admin123`

## Project structure

```
backend-java/
├── pom.xml
├── src/main/java/com/giftmart/
│   ├── GiftMartApplication.java
│   ├── config/          (Security, CORS, Seed, Exception handler)
│   ├── document/        (User, Product, Order + payment fields, Review, Reminder)
│   ├── repository/      (Spring Data MongoDB)
│   ├── dto/             (AuthRequest, AuthResponse)
│   ├── service/         (AuthService)
│   ├── controller/      (REST controllers)
│   ├── security/        (JWT filter)
│   └── util/            (JwtUtil, LevenshteinUtil)
└── src/main/resources/
    └── application.properties
```

## Build

```bash
mvn clean package
java -jar target/gift-mart-api-1.0.0.jar
```

## Switching from Node backend

1. Stop the Node backend (port 5000).
2. Start the Java backend: `mvn spring-boot:run` in `backend-java`.
3. Keep the same MongoDB and frontend; no frontend code changes needed.
