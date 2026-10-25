import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import HeroCustomizer from '../components/home/HeroCustomizer';
import CraftPillars from '../components/home/CraftPillars';
import ArtisanSpotlight from '../components/home/ArtisanSpotlight';
import ReviewsSection from '../components/home/ReviewsSection';
import DispatchNewsletter from '../components/home/DispatchNewsletter';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockProducts';
import './HomePage.css';

/**
 * HomePage Component
 * 1. Indian Craft Marketplace: Lucknow Chikankari, Bagru, Maheshwar, Santiniketan
 * 2. Multi-criteria client-side filtering in INR
 * 3. Shopping Assistant advisor integration
 * 4. Controlled modal dialog interaction for color swatches and bespoke sizing
 */
export default function HomePage() {
  const outletCtx = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  // State for Catalog filtering & sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [highRatingOnly, setHighRatingOnly] = useState(false);
  const [under1500Only, setUnder1500Only] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // State for Quick View / Customization Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewInitialColor, setQuickViewInitialColor] = useState(null);

  // Sync search input with URL search param
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
      const el = document.getElementById('collections');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  // If a product was chosen from the Shopping Assistant modal, open its customizer
  useEffect(() => {
    if (outletCtx?.advisorProduct) {
      setQuickViewProduct(outletCtx.advisorProduct);
      setQuickViewInitialColor(outletCtx.advisorProduct.colorVariants?.[0] || null);
      outletCtx.setAdvisorProduct(null);
    }
  }, [outletCtx]);

  // Derived state: Multi-criteria filtering in INR
  const filteredProducts = MOCK_PRODUCTS.filter((item) => {
    // 1. Category check
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // 2. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.shortDescription.toLowerCase().includes(q);
      const matchMaterials = item.materials?.toLowerCase().includes(q);
      const matchArtisan =
        item.artisan.name.toLowerCase().includes(q) ||
        item.artisan.studio.toLowerCase().includes(q) ||
        item.artisan.location.toLowerCase().includes(q) ||
        item.artisan.state?.toLowerCase().includes(q);

      if (!matchName && !matchDesc && !matchArtisan && !matchMaterials) {
        return false;
      }
    }

    // 3. Sub-filter toggles (Indian rupee thresholds)
    if (customizableOnly && !item.allowsCustomMeasurements && !item.customizable) return false;
    if (highRatingOnly && item.rating < 4.9) return false;
    if (under1500Only && item.price >= 1500) return false;

    return true;
  });

  // Apply sorting in INR
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default 'featured' keeps curated order
  });

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setCustomizableOnly(false);
    setHighRatingOnly(false);
    setUnder1500Only(false);
    setSortBy('featured');
    if (searchParams.get('search')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams, { replace: true });
    }
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    customizableOnly ||
    highRatingOnly ||
    under1500Only ||
    sortBy !== 'featured';

  return (
    <div className="homepage-root">
      {/* 1. Interactive Chikankari Studio Bench Hero */}
      <HeroCustomizer />

      {/* 2. Indian Maker Manifesto Pillars */}
      <CraftPillars />

      {/* 3. Main Curated Indian Marketplace Catalog */}
      <section className="catalog-section" id="collections">
        <div className="container">
          <div className="catalog-header">
            <span className="section-tag">Handcrafted in India</span>
            <h2 className="section-title">Authentic Creations from Independent Ateliers</h2>
            <p className="section-subtitle">
              Filter by heritage handloom cluster, vegetable dye technique, or custom dress sizing availability.
            </p>
          </div>

          {/* Interactive Controls Bar */}
          <div className="catalog-controls-bar">
            {/* Top Row: Categories & Search Input */}
            <div className="controls-top-row">
              <div className="category-pills-list">
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="catalog-search-box">
                <Search size={15} className="catalog-search-icon" />
                <input
                  type="text"
                  placeholder="Filter by craft, fabric, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="catalog-search-input"
                  aria-label="Filter products"
                />
              </div>
            </div>

            {/* Bottom Row: Sub-filters in INR & Sort */}
            <div className="controls-bottom-row">
              <div className="subfilter-pills">
                <button
                  type="button"
                  className={`subfilter-btn ${customizableOnly ? 'active' : ''}`}
                  onClick={() => setCustomizableOnly(!customizableOnly)}
                >
                  ✨ Custom Dress Sizing
                </button>

                <button
                  type="button"
                  className={`subfilter-btn ${highRatingOnly ? 'active' : ''}`}
                  onClick={() => setHighRatingOnly(!highRatingOnly)}
                >
                  ⭐ Top Rated (4.9+)
                </button>

                <button
                  type="button"
                  className={`subfilter-btn ${under1500Only ? 'active' : ''}`}
                  onClick={() => setUnder1500Only(!under1500Only)}
                >
                  Under ₹1,500
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="subfilter-btn"
                    onClick={handleResetFilters}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Reset all filters"
                  >
                    <RotateCcw size={11} /> Reset Filters
                  </button>
                )}
              </div>

              {/* Sort Selector in INR */}
              <div className="sort-select-wrap">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                  aria-label="Sort collection items"
                >
                  <option value="featured">Featured Atelier Order</option>
                  <option value="price-low">Price: Low to High (INR)</option>
                  <option value="price-high">Price: High to Low (INR)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Metadata Line */}
          <div className="catalog-meta-line">
            <span>
              Showing <strong>{sortedProducts.length}</strong> of {MOCK_PRODUCTS.length} Indian artisan pieces
            </span>
            {hasActiveFilters && (
              <span style={{ color: 'var(--color-terracotta)' }}>Filtered results active</span>
            )}
          </div>

          {/* Product Cards Grid or Empty State */}
          {sortedProducts.length > 0 ? (
            <div className="products-preview-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(item, color) => {
                    setQuickViewProduct(item);
                    setQuickViewInitialColor(color || item.colorVariants?.[0] || null);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="catalog-empty-state">
              <SlidersHorizontal size={36} className="catalog-empty-icon" />
              <h3 className="catalog-empty-title">No Studio Pieces Match Your Filters</h3>
              <p className="catalog-empty-desc">
                We couldn't find handcrafted items matching "{searchQuery || 'selected criteria'}". Try clearing filters or exploring other collections.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Editorial Artisan Spotlight: Begum Naseem Akhtar */}
      <ArtisanSpotlight />

      {/* 5. Indian Customer Stories & Provenance Reviews */}
      <ReviewsSection />

      {/* 6. The Craftly Dispatch Postal Newsletter */}
      <DispatchNewsletter />

      {/* 7. Quick View / Custom Dress Sizing Modal Dialog */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          initialColor={quickViewInitialColor}
          onClose={() => {
            setQuickViewProduct(null);
            setQuickViewInitialColor(null);
          }}
        />
      )}
      <section className="catalog-section" id="home2">
        <h6><p>Hello from the home2 section</p></h6>
        <h6><p>Hello from the home2 section</p></h6>
        <h6><p>Hello from the home2 section</p></h6>
      </section>
    </div>
  );
}
