# Craftly — Indian Artisan Marketplace & AI Shopping Assistant

Craftly is a curated e-commerce platform dedicated to independent Indian weavers, Chikankari artisans, and generational craft ateliers. It features bespoke dress tailoring, live natural-dye color previewing, synchronized wishlist and cart state, and a catalogue-aware AI shopping advisor.

---

## ✨ Key Features

1. **Authentic Indian Marketplace Identity**
   - Curated master clusters: Lucknow Chikankari, Bagru Dabu block print, Maheshwari silk-cotton, and Santiniketan embossed leather.
   - Genuine artisan profiles, lead times, craft techniques, and transparent price structures in Indian Rupees (INR).

2. **Live Studio Bench & Colorways**
   - Clickable natural-dye swatches (Ivory, Terracotta Rust, Pistachio Sage, Indigo Neel).
   - Consistent garment silhouette preview without switching to unrelated product photography.
   - Live cuff monogramming preview.

3. **Bespoke Made-to-Measure Custom Sizing**
   - Toggle between standard sizing (XS–XXL) and custom tailoring (+₹350 fee).
   - Interactive measurement form with dual-unit support (inches / cm) and range validation.

4. **Multi-Criteria Search & Filtering**
   - Full-text search across crafts, techniques, materials, and artisan ateliers.
   - Filter by categories, bespoke tailoring availability, customer ratings (4.9+), and budget thresholds (Under ₹1,500).
   - Instant filter reset and graceful empty-state handling.

5. **Craftly Artisan Shopping Advisor (Rule-Based NLP)**
   - Context-aware natural language assistant parsing budgets, categories, occasions, and sizing questions.
   - Honest catalogue recommendations without hallucinating non-existent products or stock.
   - Responsive chat drawer with suggested query chips.

6. **Persistent Cart & Wishlist Management**
   - Real-time subtotal, coupon discount (`CRAFTLY10`), tailoring fees, and insured shipping calculations.
   - LocalStorage persistence across page refreshes and route transitions.

7. **Artisan Checkout Simulation**
   - Indian Pincode (6-digit) and 10-digit mobile number validation.
   - Multiple simulated payment options (UPI / NetBanking / Cash on Delivery).
   - Unique order confirmation generation (`CRF-IN-XXXXXX`) with immediate cart reset.

---

## 🛠️ Technology Stack & Architecture

Craftly is organized with clean separation between the frontend storefront and enterprise backend:

```
craftly/
├── client/              # Frontend Storefront (React 19, Vite 8, React Router 7, Vanilla CSS)
├── server/              # Enterprise Backend (NestJS 12, Prisma 6, PostgreSQL 16, Redis 7)
├── docker-compose.yml   # Multi-container local database & cache services
└── package.json         # Workspace root orchestrator with automated script delegates
```

### Frontend (`client/`)
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with customized HSL tokens, typography, and responsive media queries
- **Code Quality**: Oxlint

### Backend (`server/`)
- **Framework**: NestJS 12 (TypeScript, Fastify/Express modular monolith)
- **Database & ORM**: PostgreSQL 16 with Prisma 6
- **Caching & Queues**: Redis 7
- **API Spec**: OpenAPI 3.1 (Swagger) at `/api/docs`
- **Validation**: Class-validator with DTOs and global exception filters

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or v22 recommended)
- npm (v10 or higher)
- Docker & Docker Compose (for PostgreSQL & Redis)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/shru06-pro/Craftly.git
cd craftly

# Install dependencies across all workspaces
npm install
npm --prefix client install
npm --prefix server install
```

### Running the Services

```bash
# 1. Start PostgreSQL 16 & Redis
docker compose up -d

# 2. Push Prisma schema & seed authentic artisan catalogue
npm --prefix server run prisma db push
npm --prefix server run prisma:seed

# 3. Start Frontend Storefront (http://localhost:5173)
npm run dev:client   # or npm run dev

# 4. Start Backend Server (http://localhost:4000/v1 & Swagger http://localhost:4000/api/docs)
npm run dev:server
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:client
npm run build:server
```

---

## 📜 License
Crafted with pride celebrating independent Indian makers.
