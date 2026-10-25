# Craftly — India’s Artisan & Bespoke Marketplace

[![GitHub Repository](https://img.shields.io/badge/GitHub-shru06--pro%2FCraftly-181717?style=flat&logo=github)](https://github.com/shru06-pro/Craftly)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_%7C_Vite_8-61DAFB?style=flat&logo=react)](https://github.com/shru06-pro/Craftly/tree/main/client)
[![Backend](https://img.shields.io/badge/Backend-NestJS_12_%7C_TypeScript-E0234E?style=flat&logo=nestjs)](https://github.com/shru06-pro/Craftly/tree/main/server)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_16_%7C_Prisma_6-336791?style=flat&logo=postgresql)](https://github.com/shru06-pro/Craftly/tree/main/server/prisma)

Craftly is a curated e-commerce platform and bespoke studio atelier celebrating independent Indian weavers, Chikankari embroiderers, generational leather ateliers, and heritage craft guilds.

The project features live natural-dye colorways, custom made-to-measure tailoring with dual-unit precision validation, a catalogue-aware AI Craft Advisor, and a production-grade TypeScript modular monolith backend.

---

## 📌 Project Status & Current Scope

Craftly is executing the roadmap outlined in [Craftly Backend: Enterprise Implementation Plan](./Craftly%20Backend%20Enterprise%20Implementation%20Plan.md):

- [x] **Storefront Experience (`client/`)**: Fully functional React 19 SPA with bespoke customizer, wishlist, cart drawer, simulated checkout with PIN/phone validation, and rule-based advisor.
- [x] **Frontend Refinement**: Immutable cart quantity updates, canonical `/product/:id` routing, and cleaned form defaults.
- [x] **Fullstack Directory Separation**: Clean multi-package architecture separating the React client (`client/`) and NestJS backend (`server/`).
- [x] **Phase 0 (Foundations)**: NestJS 12 modular monolith with NodeNext ESM, Docker Compose (PostgreSQL 16 + Redis 7), global error/response envelopes, and Swagger OpenAPI 3.1.
- [x] **Phase 1 (Core Domain & Catalogue)**: Comprehensive Prisma 6 schema covering Users, MeasurementProfiles, Artisans, Products, Variants, Orders, Fulfilment Milestones, and Coupons. Seeded with 8 authentic Indian craft products and 6 master guilds.
- [x] **Server-Authoritative Pricing Engine**: Subtotal in paise, ₹350 tailoring fee calculations, free shipping rules (threshold ₹1,499), and coupon validation (`CRAFTLY10`, `FIRSTCRAFT`, `ATELIER500`).
- [ ] **Phase 2 (In Progress)**: Connecting client cart, checkout, and assistant directly to live backend REST endpoints via TanStack Query.

---

## 📂 Project Structure

```
craftly/
├── client/                              # 🎨 Frontend Client (React 19 + Vite 8)
│   ├── public/                          # Static assets, product images & swatches
│   │   ├── images/                      # Chikankari, Bagru, leather, jewelry, textiles
│   │   └── favicon.svg, icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/                    # CartDrawer, CheckoutModal
│   │   │   ├── common/                  # ProductCard, QuickViewModal, CustomSizingForm, ShoppingAssistant, AuthModal
│   │   │   ├── home/                    # HeroCustomizer, CraftPillars, ArtisanSpotlight, ReviewsSection, DispatchNewsletter
│   │   │   └── layout/                  # Navbar, AnnouncementBar, Footer, FooterModal
│   │   ├── context/                     # CartContext, WishlistContext
│   │   ├── data/                        # mockProducts.js (8 authentic craft items)
│   │   ├── pages/                       # HomePage, ProductDetailPage, WishlistPage, NotFoundPage
│   │   ├── styles/                      # variables.css (HSL tokens, typography, radii)
│   │   ├── utils/                       # assistantNLP, formatCurrency, productCustomization
│   │   ├── App.jsx                      # App router with canonical route redirects
│   │   └── main.jsx                     # Client entrypoint
│   ├── package.json                     # Client dependencies (React, Vite, Lucide)
│   └── vite.config.js
│
├── server/                              # ⚙️ Enterprise Backend (NestJS 12 + Prisma 6)
│   ├── prisma/
│   │   ├── schema.prisma                # Enterprise PostgreSQL domain schema
│   │   └── seed.ts                      # Catalogue seed script
│   ├── src/
│   │   ├── common/
│   │   │   ├── filters/                 # AllExceptionsFilter (Uniform error envelope)
│   │   │   └── interceptors/            # TransformInterceptor (Uniform success envelope)
│   │   ├── modules/
│   │   │   ├── catalogue/               # Product search, filter, categories, artisans
│   │   │   ├── pricing/                 # Server-authoritative paise pricing & coupon rules
│   │   │   ├── orders/                  # Idempotent checkout sessions & milestone tracking
│   │   │   ├── assistant/               # Catalogue-backed Craft Advisor query engine
│   │   │   └── newsletter/              # The Craftly Dispatch subscription service
│   │   ├── prisma/                      # Global Prisma database service & module
│   │   ├── app.module.ts                # Root application module
│   │   └── main.ts                      # NestJS bootstrap with Swagger documentation
│   ├── .env.example                     # Environment template
│   ├── package.json                     # Backend dependencies (NestJS, Prisma, Swagger)
│   └── tsconfig.json
│
├── docker-compose.yml                   # PostgreSQL 16 & Redis 7 container configuration
├── package.json                         # Workspace orchestrator root scripts
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router DOM 7, Lucide Icons, Vanilla CSS Design System |
| **Backend** | NestJS 12 (TypeScript, NodeNext ESM), Express adapter, Swagger OpenAPI 3.1 |
| **Database & ORM** | PostgreSQL 16 / 18, Prisma ORM 6.19 |
| **Cache & Queue** | Redis 7 (ElastiCache / Docker ready) |
| **Tooling & Linter** | Oxlint, Prettier, Vitest |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **npm**: v10 or higher
- **PostgreSQL**: Either running locally on port `5432` or via Docker

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/shru06-pro/Craftly.git
cd craftly

# Install root, client, and server dependencies
npm install
npm --prefix client install
npm --prefix server install
```

---

### Step 2: Database Setup

#### Option A: Using Docker (Recommended for containerized workflows)
```bash
npm run docker:up
```

#### Option B: Using Local PostgreSQL (Installed on Windows)
1. Ensure your local PostgreSQL service (`postgresql-x64-18` on port `5432`) is running.
2. Configure your password in `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/craftly_db?schema=public"
   ```

#### Initialize Schema & Seed Data
```bash
cd server
npx prisma db push
npx prisma db seed
cd ..
```

---

### Step 3: Run the Development Servers

Open two terminal tabs from the project root:

#### Terminal 1 — Start the Storefront Frontend:
```bash
npm run dev:client
```
👉 Available at: **[http://localhost:5173](http://localhost:5173)**

#### Terminal 2 — Start the Enterprise Backend API:
```bash
npm run dev:server
```
👉 API Base URL: **[http://localhost:4000/v1](http://localhost:4000/v1)**  
👉 Interactive OpenAPI (Swagger) Documentation: **[http://localhost:4000/api/docs](http://localhost:4000/api/docs)**

---

## 📡 Backend API Endpoints (OpenAPI 3.1)

All endpoints are versioned under `/v1` and documentable interactively via Swagger:

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Catalogue** | `GET` | `/v1/catalogue/products` | Search, filter by craft, category, price bounds, customizable |
| **Catalogue** | `GET` | `/v1/catalogue/products/:slug` | Full product view with artisan, colorways, media, and reviews |
| **Catalogue** | `GET` | `/v1/catalogue/categories` | Categories with active product counts |
| **Catalogue** | `GET` | `/v1/catalogue/artisans` | Verified artisan guild profiles |
| **Pricing** | `POST` | `/v1/pricing/quote` | Authoritative quote (subtotal, ₹350 tailoring, shipping, GST, coupon) |
| **Pricing** | `GET` | `/v1/pricing/coupon/validate` | Validates coupon rules against cart subtotal |
| **Orders** | `POST` | `/v1/orders/checkout` | Idempotent order session creation with milestone generation |
| **Orders** | `GET` | `/v1/orders/:orderNumber` | Track order progress and production milestones |
| **Advisor** | `POST` | `/v1/assistant/query` | Catalogue-backed NLP search for gifts, budgets, and techniques |
| **Newsletter** | `POST` | `/v1/newsletter/subscribe` | The Craftly Dispatch subscription management |

---

## 💻 Root Orchestrator Scripts

Execute common workflows across client and server from the root directory:

```bash
# Development
npm run dev:client         # Run React frontend (Vite)
npm run dev:server         # Run NestJS backend with hot-reload

# Production Build
npm run build              # Builds both client and server
npm run build:client       # Compiles frontend bundle (client/dist/)
npm run build:server       # Compiles NestJS backend (server/dist/)

# Database & Containers
npm run docker:up          # Start PostgreSQL & Redis in Docker
npm run docker:down        # Stop Docker containers
```

---

## 📜 License & Credits

Built with pride celebrating generational Indian artisans and master craftsmen across Uttar Pradesh, Rajasthan, West Bengal, Odisha, and Madhya Pradesh.
