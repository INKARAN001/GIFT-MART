# Gift Mart

## Overview

Gift Mart is a full-stack e-commerce web app for curated gifts. It lets customers browse products, manage a cart and wishlist, pay securely with a card (Stripe), and track orders. It also supports event reminders, newsletter signup with email verification, and an admin area for catalog and orders.

**What problem does it solve?**  
It provides a single place to discover gifts, complete checkout with transparent fees (merchandise + distance-based shipping from a Jaffna hub), and stay engaged via reminders and promotions.

**Repository:** [github.com/INKARAN001/GIFT-MART](https://github.com/INKARAN001/GIFT-MART) — `git clone https://github.com/INKARAN001/GIFT-MART.git`

**Sprint 4 planning:** See [`SPRINT_4_PLAN.md`](SPRINT_4_PLAN.md) (timeline, story order, integration gates, demo script link). **Risks & mitigations:** [`docs/SPRINT_4_RISKS.md`](docs/SPRINT_4_RISKS.md).

---

## Documentation index

| Doc | Purpose |
|-----|---------|
| [`SPRINT_4_PLAN.md`](SPRINT_4_PLAN.md) | Sprint timeline, US ownership, Git workflow, scope rules |
| [`docs/SPRINT_4_RISKS.md`](docs/SPRINT_4_RISKS.md) | Sprint killers: API/Stripe mismatch, idempotency, per-US risks, AI tooling limits |
| [`docs/API_ORDERS.md`](docs/API_ORDERS.md) | `POST /api/orders` and `POST /api/orders/recover` — **freeze before integration** |
| [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | Daily regression / demo steps |
| [`docs/STRIPE_TESTING.md`](docs/STRIPE_TESTING.md) | Stripe test cards (success + decline) |
| [`docs/api.http`](docs/api.http) | REST Client smoke requests (health, auth, orders) |
| [`docs/USER_FLOWS_AND_IMPACT.md`](docs/USER_FLOWS_AND_IMPACT.md) | User journeys, backend steps, deploy/env impact |
| [`frontend/.env.example`](frontend/.env.example) | Vite env template |
| [`backend-java/.env.example`](backend-java/.env.example) | Backend env reference (Render/shell; Spring does not auto-load `.env`) |
| [`backend-java/README.md`](backend-java/README.md) | API-specific quick start |

---

## API contracts & integration

Place-order and recover payloads are documented in [`docs/API_ORDERS.md`](docs/API_ORDERS.md). Lock this contract before the main integration day (target **13 Apr 2026** EOD).

**Stripe:** Use **test** keys only during development. Verify **success** (`4242…4242`) and **decline** (`4000…0002`) paths per [`docs/STRIPE_TESTING.md`](docs/STRIPE_TESTING.md) — not on demo day for the first time.

### Feature flags (`FEATURES`)

Kill switches live in [`frontend/src/config/features.js`](frontend/src/config/features.js): `FEATURES.REVIEWS`, `FEATURES.REMINDERS`, `FEATURES.PROMOS`, `FEATURES.ADMIN_STATS`. Set matching `VITE_ENABLE_*` to `"false"` in `frontend/.env` to disable UI without code changes.

| Variable | When `"false"` |
|----------|------------------|
| `VITE_ENABLE_REVIEWS` | Hides product review UI |
| `VITE_ENABLE_REMINDERS` | Hides `/reminders` and navbar bell |
| `VITE_ENABLE_PROMOS` | Hides promotional email checkbox in profile |
| `VITE_ENABLE_ADMIN_STATS` | Skips `GET /api/admin/stats` for admin dashboard order/revenue figures |

**Demo priority:** checkout → profile orders → reviews. Optional: reminders, promos, heavy admin stats — see [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

### Environment templates

| File | Role |
|------|------|
| [`frontend/.env.example`](frontend/.env.example) | `VITE_API_BASE_URL`, Stripe publishable key, Maps key, feature flags |
| [`backend-java/.env.example`](backend-java/.env.example) | Reference for MongoDB, JWT, Stripe, `GOOGLE_MAPS_API_KEY`, `FRONTEND_URL`, `SPRING_PROFILES_ACTIVE` |

**Spring profiles:** `application-dev.properties` / `application-prod.properties` under `backend-java/src/main/resources/`. Default profile is **`dev`** (`spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`). On Render, set **`SPRING_PROFILES_ACTIVE=prod`**.

**Quick API checks:** [`docs/api.http`](docs/api.http).

**End-to-end behavior (checkout, CORS, fallbacks):** [`docs/USER_FLOWS_AND_IMPACT.md`](docs/USER_FLOWS_AND_IMPACT.md).

### Production frontend (e.g. Vercel)

- Set **`VITE_API_BASE_URL`** to your API **origin including `/api`**, e.g. `https://your-service.onrender.com/api`. The app uses [`getApiBaseUrl()`](frontend/src/utils/apiBase.js) so all `fetch` / `fetchWithAuth` calls target the deployed API (dev relies on relative `/api` + Vite proxy).
- Set backend **`FRONTEND_URL`** to your site origin (comma-separated for multiple previews). **CORS** is required — misconfiguration shows as blocked requests in the browser console, not on the server alone.

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 18, Vite 5, React Router, Tailwind CSS, Axios, Stripe.js, Google Maps (`@react-google-maps/api`), Swiper |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data MongoDB, Spring Mail, Stripe Java SDK |
| **Database** | MongoDB |

## Features

- **Auth** — Register, login, JWT sessions, email verification on signup, password reset flow
- **Catalog** — Products, categories, search, product detail, reviews (toggle via `FEATURES.REVIEWS`)
- **Shopping** — Cart, wishlist, stock-aware checkout
- **Payments** — Card checkout via **Stripe** PaymentIntent; totals = items + **2% merchandise fee** + **distance-based shipping** from Jaffna hub
- **Shipping** — Map pin / live location / full address; optional Google Maps; fallbacks if Distance Matrix fails (`giftmart.shipping.*` in `application.properties`)
- **Amount calculator** — `/amount-calculator` for fee preview
- **Newsletter** — Subscribe with email verification (Gmail SMTP when configured)
- **Reminders** — Event reminders (toggle via `FEATURES.REMINDERS`)
- **Profile** — Orders, address, notification preferences (promo UI toggle via `FEATURES.PROMOS`)
- **Admin** — Catalog, users, reviews; dashboard stats optional via `FEATURES.ADMIN_STATS`

---

## Deployment

**Live URL:** _(add your production link)_

### Backend on [Render](https://render.com)

Docker: `backend-java/Dockerfile`, blueprint: `render.yaml`.

1. Connect repo [INKARAN001/GIFT-MART](https://github.com/INKARAN001/GIFT-MART).
2. **New → Blueprint** (or Web Service: Docker, context `backend-java`).
3. **Environment** (minimum):

   | Variable | Notes |
   |----------|--------|
   | `MONGODB_URI` | e.g. MongoDB Atlas |
   | `JWT_SECRET` | Long random string |
   | `FRONTEND_URL` | Deployed frontend origin (CORS) |
   | `STRIPE_SECRET_KEY` | Stripe secret |
   | `STRIPE_CHARGE_CURRENCY` | e.g. `usd` |
   | `STRIPE_LKR_PER_USD` | LKR per 1 USD if charging in USD |
   | `GOOGLE_MAPS_API_KEY` | Optional |
   | `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD` | Optional mail |
   | `SPRING_PROFILES_ACTIVE` | Set **`prod`** for production profile |

4. Frontend production build: set **`VITE_API_BASE_URL`** to the API root including `/api`, e.g. `https://your-api.onrender.com/api` (see `frontend/.env.example`).

Health check: **`GET /api/health`**. Free tiers may cold-start.

### Frontend

Deploy the Vite build (Vercel, Netlify, Cloudflare Pages, etc.) with the same env vars as production (Stripe publishable key, Maps key, `VITE_API_BASE_URL`, feature flags as needed).

---

## Screenshots

_Add under `docs/screenshots/` and embed here if desired._

---

## Setup (run locally)

### Prerequisites

- **Java 17+**, **Maven 3.6+**
- **Node.js 18+**, **npm**
- **MongoDB** local (`mongodb://localhost:27017/gift-mart`) or Atlas

### 1. Clone

```bash
git clone https://github.com/INKARAN001/GIFT-MART.git
cd GIFT-MART
```

### 2. Backend (`backend-java`)

Copy env ideas from [`backend-java/.env.example`](backend-java/.env.example). For local secrets, prefer **`application-local.properties`** (see [`backend-java/src/main/resources/application-local.properties.example`](backend-java/src/main/resources/application-local.properties.example)) or export `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, etc.

```bash
cd backend-java
mvn spring-boot:run
```

API: **http://localhost:5000** (default; Render uses `PORT`). Optional: `run-with-mail.ps1` on Windows.

Details: [`backend-java/README.md`](backend-java/README.md).

### 3. Frontend (`frontend`)

```bash
cd frontend
npm install
cp .env.example .env   # then edit: Stripe publishable key, optional Maps key
npm run dev
```

Dev server: **http://localhost:3000** (see `frontend/vite.config.js`). Requests to **`/api`** proxy to **localhost:5000**.

Production: `npm run build` → `npm run preview` to test `dist/`.

### 4. Default admin (empty DB seed)

- Email: `admin@giftmart.com`  
- Password: `admin123`  

Change in production.

### 5. Stripe & Maps

- Use **matching** test publishable + secret keys.
- Google Maps: billing may be required on GCP for Maps / Distance Matrix / Geocoding.

---

## Repository layout

```
GIFT-MART/
├── README.md                 # This file
├── SPRINT_4_PLAN.md          # Sprint 4 plan
├── render.yaml               # Render blueprint
├── .gitignore                # Root ignores (dist, node_modules, target, .env, …)
├── docs/
│   ├── API_ORDERS.md         # Checkout API contract
│   ├── SPRINT_4_RISKS.md     # Sprint 4 risk register (integration, Stripe, AI tooling)
│   ├── DEMO_SCRIPT.md        # Demo / daily script
│   ├── STRIPE_TESTING.md     # Test cards
│   ├── USER_FLOWS_AND_IMPACT.md  # Flows + backend + impact
│   └── api.http              # HTTP smoke file
├── frontend/
│   ├── .env.example
│   ├── src/
│   │   ├── config/features.js
│   │   ├── pages/
│   │   └── …
│   └── public/photos/        # Product images (source of truth for galleries)
└── backend-java/
    ├── .env.example
    ├── Dockerfile
    ├── pom.xml
    └── src/main/
        ├── java/com/giftmart/
        └── resources/
            ├── application.properties
            ├── application-dev.properties
            └── application-prod.properties
```

**Do not commit:** `frontend/node_modules/`, `frontend/dist/`, `backend-java/target/`, `backend-java/uploads/`, secrets in `.env` / `application-local.properties` (see `.gitignore`).

---

## License

_Add your license (e.g. MIT, or coursework notice)._
