// src/components/home/HomeCuratedSections.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Store,
  Scissors,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '../common/ProductCard.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import './HomeCuratedSections.css';

/**
 * 2. NEW ARRIVALS
 */
export function NewArrivalsSection({ onSelectProduct }) {
  const newArrivals = [
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w1'),
    MOCK_PRODUCTS.find((p) => p.id === 'prod-1'),
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w2'),
    MOCK_PRODUCTS.find((p) => p.id === 'prod-b1'),
  ].filter(Boolean);

  return (
    <section className="home-editorial-section" id="new-arrivals">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Sparkles size={13} color="var(--color-terracotta, #B85834)" />
            <span>Fresh Drops</span>
          </div>
          <h2 className="home-section-title">New Arrivals from Homegrown Boutiques</h2>
          <p className="home-section-subtitle">
            The latest creations from independent Indian designers, family craft guilds, and local ateliers.
          </p>
        </div>

        <div className="home-products-grid">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/shop" className="btn-secondary">
            <span>Explore All New Arrivals</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 3. SHOP INDIAN ETHNIC
 */
export function ShopEthnicSection({ onSelectProduct }) {
  const ethnicPicks = [
    MOCK_PRODUCTS.find((p) => p.id === 'prod-1'),  // Chikankari Kurta
    MOCK_PRODUCTS.find((p) => p.id === 'prod-e2'), // Banarasi Saree
    MOCK_PRODUCTS.find((p) => p.id === 'prod-e3'), // Chanderi Anarkali
    MOCK_PRODUCTS.find((p) => p.id === 'prod-4'),  // Kundan Choker
  ].filter(Boolean);

  return (
    <section className="home-editorial-section bg-sand-tint" id="indian-ethnic">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Sparkles size={13} color="var(--color-terracotta, #B85834)" />
            <span>Heritage Handlooms</span>
          </div>
          <h2 className="home-section-title">Shop Indian Ethnic Wear</h2>
          <p className="home-section-subtitle">
            Authentic Lucknowi Chikankari needlework, pure Banarasi silk sarees, and flared Chanderi Anarkalis direct from master weavers.
          </p>
        </div>

        <div className="home-products-grid">
          {ethnicPicks.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/shop?category=ethnic" className="btn-primary">
            <span>Shop Full Indian Ethnic Collection</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 4. SHOP WESTERN
 */
export function ShopWesternSection({ onSelectProduct }) {
  const westernPicks = [
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w1'), // Boyfriend shirt
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w2'), // Wide leg jeans
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w3'), // Cargo trousers
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w4'), // Linen blazer
  ].filter(Boolean);

  return (
    <section className="home-editorial-section" id="western-wear">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Sparkles size={13} color="var(--color-terracotta, #B85834)" />
            <span>Modern Silhouettes</span>
          </div>
          <h2 className="home-section-title">Shop Women's Western Wear</h2>
          <p className="home-section-subtitle">
            Breathable organic khadi boyfriend shirts, wide-leg raw denims, and relaxed utility cargo trousers designed for Indian weather.
          </p>
        </div>

        <div className="home-products-grid">
          {westernPicks.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/shop?category=western" className="btn-secondary">
            <span>Explore All Western Collections</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 6. COLLEGE & EVERYDAY EDIT
 */
export function CollegeEverydaySection({ onSelectProduct }) {
  const collegePicks = [
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w1'), // Boyfriend shirt (₹1299)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-b2'), // Canvas Tote (₹799)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-f1'), // Kolhapuri Flats (₹1299)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-j1'), // Silver Jhumkas (₹899)
  ].filter(Boolean);

  return (
    <section className="home-editorial-section bg-sand-tint" id="college-edit">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Sparkles size={13} color="var(--color-terracotta, #B85834)" />
            <span>Under ₹1,500</span>
          </div>
          <h2 className="home-section-title">College &amp; Everyday Edit</h2>
          <p className="home-section-subtitle">
            Effortless campus style designed for 18–25 year olds. Breathable cotton staples, heavy-duty laptop totes, and cushioned Kolhapuris.
          </p>
        </div>

        <div className="home-products-grid">
          {collegePicks.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/shop?maxPrice=1500" className="btn-secondary">
            <span>Browse Campus Staples Under ₹1,500</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 7. UNDER ₹999
 */
export function Under999Section({ onSelectProduct }) {
  const under999Picks = [
    MOCK_PRODUCTS.find((p) => p.id === 'prod-b2'),  // Canvas Tote (₹799)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-j1'),  // Silver Jhumkas (₹899)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-bt1'), // Kannauj Rose Mist (₹649)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-8'),   // Khurja Chai Kulhars (₹899)
  ].filter(Boolean);

  return (
    <section className="home-editorial-section" id="under-999">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Tag size={13} color="var(--color-terracotta, #B85834)" />
            <span>Budget Treasures</span>
          </div>
          <h2 className="home-section-title">Curated Under ₹999</h2>
          <p className="home-section-subtitle">
            Exceptional handcrafted design at accessible Indian prices. Authentic silver jewelry, organic canvas bags, and artisanal wellness.
          </p>
        </div>

        <div className="home-products-grid">
          {under999Picks.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/shop?maxPrice=999" className="btn-secondary">
            <span>Shop All Treasures Under ₹999</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 8. PREMIUM COLLECTIONS
 */
export function PremiumCollectionsSection({ onSelectProduct }) {
  const premiumPicks = [
    MOCK_PRODUCTS.find((p) => p.id === 'prod-e2'), // Banarasi Silk Saree (₹4899)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-w4'), // Linen Blazer (₹3299)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-b1'), // Santiniketan Leather Tote (₹3250)
    MOCK_PRODUCTS.find((p) => p.id === 'prod-e3'), // Chanderi Anarkali (₹3699)
  ].filter(Boolean);

  return (
    <section className="home-editorial-section bg-sand-tint" id="premium-collections">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Sparkles size={13} color="var(--color-terracotta, #B85834)" />
            <span>Quiet Luxury &amp; Heirlooms</span>
          </div>
          <h2 className="home-section-title">Premium Collections &amp; Bespoke Tailoring</h2>
          <p className="home-section-subtitle">
            Heirloom creations woven with pure silk warp, vegetable-tanned hides, and bespoke measurement customization for timeless poise.
          </p>
        </div>

        <div className="home-products-grid">
          {premiumPicks.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/shop?minPrice=3000" className="btn-primary">
            <span>Explore Premium Heirlooms</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 9. BESTSELLING INDIAN BRANDS
 */
export function BestsellingBrandsSection() {
  const brands = [
    {
      id: 'artisan-chikankari',
      name: 'Noor Chikankari Guild',
      founder: 'Begum Naseem Akhtar',
      city: 'Hazratganj, Lucknow',
      state: 'Uttar Pradesh',
      craft: '32-Stitch Awadhi Needlework',
      badge: 'National Awardee',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      leadTime: '4–6 Days',
    },
    {
      id: 'artisan-denim',
      name: 'Denim Vats of Surat',
      founder: 'Ramesh Patel',
      city: 'Surat',
      state: 'Gujarat',
      craft: 'Raw Selvedge Denim',
      badge: 'Bestseller Denim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      leadTime: '3–5 Days',
    },
    {
      id: 'artisan-maati',
      name: 'Maati Studio Collective',
      founder: 'Sunita Rao',
      city: 'Navrangpura, Ahmedabad',
      state: 'Gujarat',
      craft: 'Handspun Khadi & Organic Cotton',
      badge: 'Campus Staple',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
      leadTime: '2–4 Days',
    },
    {
      id: 'artisan-bagru',
      name: 'Chippa Mohalla Ateliers',
      founder: 'Ramdev Chippa',
      city: 'Bagru, Jaipur',
      state: 'Rajasthan',
      craft: 'Dabu Mud-Resist Block Print',
      badge: 'Master Weaver',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
      leadTime: '5–7 Days',
    },
    {
      id: 'artisan-jewelry',
      name: 'Johari Bazaar Smiths',
      founder: 'Keshav & Sunita Soni',
      city: 'Johari Bazaar, Jaipur',
      state: 'Rajasthan',
      craft: 'Meenakari & Kundan Jewelry',
      badge: 'Heirloom Smiths',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      leadTime: '3–5 Days',
    },
    {
      id: 'artisan-leather',
      name: 'Bishnupur Craft Guild',
      founder: 'Subhash Mondal',
      city: 'Santiniketan, Bolpur',
      state: 'West Bengal',
      craft: 'Santiniketan Embossed Leather',
      badge: 'Bestseller Atelier',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      leadTime: '3–5 Days',
    },
  ];

  return (
    <section className="home-editorial-section" id="bestselling-brands">
      <div className="container">
        <div className="home-section-header">
          <div className="home-tag-pill">
            <Store size={13} color="var(--color-terracotta, #B85834)" />
            <span>Homegrown Labels</span>
          </div>
          <h2 className="home-section-title">Bestselling Indian Brands &amp; Independent Boutiques</h2>
          <p className="home-section-subtitle">
            Verified local boutiques, generational design houses, and homegrown creators operating directly on Craftly.
          </p>
        </div>

        <div className="home-brands-grid">
          {brands.map((b) => (
            <article key={b.id} className="brand-card">
              <div className="brand-banner-wrap">
                <img src={b.banner} alt={b.name} className="brand-banner-img" />
                <div className="brand-avatar-wrap">
                  <img src={b.avatar} alt={b.founder} className="brand-avatar-img" />
                </div>
                {b.badge && <span className="brand-badge-pill">{b.badge}</span>}
              </div>

              <div className="brand-body">
                <div className="brand-location">
                  <MapPin size={12} color="var(--color-terracotta, #B85834)" />
                  <span>{b.city}, {b.state}</span>
                </div>
                <h3 className="brand-name">{b.name}</h3>
                <p className="brand-founder">Founder: <strong>{b.founder}</strong></p>
                <div className="brand-craft-tag">{b.craft}</div>

                <div className="brand-footer-row">
                  <span className="brand-lead-time">
                    <Clock size={12} />
                    <span>{b.leadTime} Craft Time</span>
                  </span>
                  <Link to={`/stores/${b.id}`} className="brand-visit-link">
                    <span>Visit Boutique</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="home-section-cta">
          <Link to="/stores" className="btn-primary">
            <span>Discover All 9 Verified Indian Ateliers</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

