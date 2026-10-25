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

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with customized HSL tokens, typography, and responsive media queries
- **Code Quality**: Oxlint

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/craftly.git

# Navigate into project directory
cd craftly

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be available at `http://localhost:5173/`.

### Linting & Building

```bash
# Run Oxlint
npm run lint

# Build for production
npm run build
```

---

## 📂 Project Architecture

```
craftly/
├── public/                 # Static assets and icons
├── src/
│   ├── components/
│   │   ├── cart/           # CartDrawer, CheckoutModal
│   │   ├── common/         # ProductCard, QuickViewModal, ShoppingAssistant, CustomSizingForm
│   │   ├── home/           # HeroCustomizer, CraftPillars, ArtisanSpotlight, ReviewsSection, DispatchNewsletter
│   │   └── layout/         # Navbar, AnnouncementBar, Footer
│   ├── context/            # CartContext, WishlistContext
│   ├── data/               # mockProducts (8 verified Indian artisan items)
│   ├── pages/              # HomePage, ProductDetailPage, WishlistPage
│   ├── utils/              # assistantNLP, formatCurrency, productCustomization
│   ├── App.jsx             # Root layout with outlet contexts
│   └── main.jsx            # React router entrypoint
├── package.json
└── vite.config.js
```

---

## 📜 License
Crafted with pride celebrating independent Indian makers.
