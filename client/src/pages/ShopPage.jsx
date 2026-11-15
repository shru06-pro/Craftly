import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, MapPin, Store } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockProducts';
import './ShopPage.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [highRatingOnly, setHighRatingOnly] = useState(false);
  const [under1500Only, setUnder1500Only] = useState(false);
  const [under3000Only, setUnder3000Only] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewInitialColor, setQuickViewInitialColor] = useState(null);

  // Sync category and search with searchParams
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Update URL params when category or search changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    setSearchParams(newParams, { replace: true });
  };

  const filteredProducts = MOCK_PRODUCTS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.shortDescription.toLowerCase().includes(q);
      const matchMaterials = item.materials?.toLowerCase().includes(q);
      const matchArtisan =
        item.artisan.name.toLowerCase().includes(q) ||
        item.artisan.studio.toLowerCase().includes(q) ||
        item.artisan.location.toLowerCase().includes(q);

      if (!matchName && !matchDesc && !matchArtisan && !matchMaterials) {
        return false;
      }
    }

    if (customizableOnly && !item.allowsCustomMeasurements && !item.customizable) return false;
    if (highRatingOnly && item.rating < 4.9) return false;
    if (under1500Only && item.price >= 1500) return false;
    if (under3000Only && item.price >= 3000) return false;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setCustomizableOnly(false);
    setHighRatingOnly(false);
    setUnder1500Only(false);
    setUnder3000Only(false);
    setSortBy('featured');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    customizableOnly ||
    highRatingOnly ||
    under1500Only ||
    under3000Only ||
    sortBy !== 'featured';

  return (
    <div className="shop-page-root">
      {/* Shop Banner Header */}
      <section className="shop-header-banner">
        <div className="container">
          <div className="shop-header-badge">
            <Sparkles size={14} color="var(--color-terracotta)" />
            <span>Curated Indian Marketplace</span>
          </div>
          <h1 className="shop-page-title">Handcrafted Treasures from Independent Ateliers</h1>
          <p className="shop-page-subtitle">
            Direct from certified master artisans in Lucknow, Jaipur, Santiniketan, Maheshwar, and Kolhapur.
            Every piece is ethically made with fair living wages.
          </p>
          <div className="shop-header-links">
            <Link to="/stores" className="shop-browse-stores-link">
              <Store size={15} style={{ marginRight: '6px' }} />
              Browse Local Artisan Stores & Ateliers &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Main Marketplace Controls & Grid */}
      <section className="shop-catalog-section">
        <div className="container">
          {/* Controls Bar */}
          <div className="catalog-controls-bar">
            {/* Top Row: Categories & Search Input */}
            <div className="controls-top-row">
              <div className="category-pills-list">
                {MOCK_CATEGORIES.filter((cat) => !cat.hidden).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
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
                  placeholder="Filter by craft, fabric, or artisan city..."
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

                <button
                  type="button"
                  className={`subfilter-btn ${under3000Only ? 'active' : ''}`}
                  onClick={() => setUnder3000Only(!under3000Only)}
                >
                  Under ₹3,000
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="subfilter-btn reset-btn"
                    onClick={handleResetFilters}
                    title="Reset all filters"
                  >
                    <RotateCcw size={11} style={{ marginRight: '4px' }} /> Reset Filters
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
                  <option value="price-low">Price: Low to High (₹ INR)</option>
                  <option value="price-high">Price: High to Low (₹ INR)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Metadata Line */}
          <div className="catalog-meta-line">
            <span>
              Showing <strong>{sortedProducts.length}</strong> of {MOCK_PRODUCTS.length} Indian handcrafted creations
            </span>
            {hasActiveFilters && (
              <span className="filter-active-tag">Filtered results active</span>
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
                We couldn't find handcrafted items matching "{searchQuery || 'selected criteria'}". Try clearing filters or exploring other craft clusters.
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

      {/* Quick View / Custom Sizing Modal Dialog */}
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
    </div>
  );
}

