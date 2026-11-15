// src/components/home/TrendingOnCraftly.jsx
import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  ArrowRight,
  Eye,
  Check,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { TRENDING_AESTHETICS, SHOP_THE_LOOKS } from '../../data/mockProducts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useWishlist } from '../../context/WishlistContext';
import ShopTheLookModal from '../common/ShopTheLookModal';
import './TrendingOnCraftly.css';

const OCCASION_FILTERS = [
  { id: 'all', label: 'All Moods' },
  { id: 'college', label: 'Campus & College Fits' },
  { id: 'work', label: 'Office & Workwear' },
  { id: 'festive', label: 'Festive & Weddings' },
  { id: 'casual', label: 'Everyday & Cafe Runs' },
];

export default function TrendingOnCraftly() {
  const [selectedAesthetic, setSelectedAesthetic] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [activeLookModal, setActiveLookModal] = useState(null);
  const [savedLooks, setSavedLooks] = useState({});

  const toggleSaveLook = (lookId, e) => {
    e.stopPropagation();
    setSavedLooks((prev) => ({
      ...prev,
      [lookId]: !prev[lookId],
    }));
  };

  // Filter looks based on selected aesthetic and occasion
  const filteredLooks = SHOP_THE_LOOKS.filter((look) => {
    if (selectedAesthetic !== 'all' && look.aestheticId !== selectedAesthetic && look.aesthetic !== selectedAesthetic) {
      return false;
    }
    if (selectedOccasion !== 'all') {
      const occLower = look.occasion.toLowerCase();
      if (selectedOccasion === 'college' && !occLower.includes('college') && !occLower.includes('campus')) return false;
      if (selectedOccasion === 'work' && !occLower.includes('work') && !occLower.includes('office')) return false;
      if (selectedOccasion === 'festive' && !occLower.includes('festive') && !occLower.includes('wedding')) return false;
      if (selectedOccasion === 'casual' && !occLower.includes('cafe') && !occLower.includes('everyday')) return false;
    }
    return true;
  });

  return (
    <section className="trending-craftly-section">
      <div className="container">
        {/* Section Header */}
        <div className="trending-header-wrap">
          <div className="trending-badge">
            <Sparkles size={14} />
            <span>Pinterest Visual Discovery</span>
          </div>
          <h2 className="trending-main-title">Trending on Craftly — Aesthetics & Looks</h2>
          <p className="trending-subtitle">
            Global fashion aesthetics adapted for Indian silhouettes, local weather, college budgets, and homegrown craft.
            Click any look to shop the individual pieces or bundle the complete ensemble with one click.
          </p>
        </div>

        {/* Aesthetics Horizontal Pills Bar */}
        <div className="aesthetics-bar-wrap">
          <div className="aesthetics-scroll-list">
            <button
              type="button"
              className={`aesthetic-pill-btn ${selectedAesthetic === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedAesthetic('all')}
            >
              <span>All Aesthetics</span>
            </button>
            {TRENDING_AESTHETICS.map((aes) => (
              <button
                key={aes.id}
                type="button"
                className={`aesthetic-pill-btn ${selectedAesthetic === aes.id ? 'active' : ''}`}
                onClick={() => setSelectedAesthetic(aes.id)}
              >
                <span>{aes.name}</span>
                {aes.badge && <span className="pill-mini-badge">{aes.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Occasion Sub-tabs */}
        <div className="occasion-tabs-row">
          {OCCASION_FILTERS.map((occ) => (
            <button
              key={occ.id}
              type="button"
              className={`occasion-tab-btn ${selectedOccasion === occ.id ? 'active' : ''}`}
              onClick={() => setSelectedOccasion(occ.id)}
            >
              {occ.label}
            </button>
          ))}
        </div>

        {/* Pinterest-Inspired Masonry Grid */}
        <div className="looks-masonry-grid">
          {filteredLooks.map((look, index) => {
            const isSaved = savedLooks[look.id];
            const bundleTotal = look.items.reduce((sum, item) => sum + item.price, 0);

            return (
              <div
                key={look.id}
                className={`look-masonry-card card-variant-${index % 3}`}
                onClick={() => setActiveLookModal(look)}
              >
                <div className="look-card-img-wrap">
                  <img src={look.image} alt={look.title} className="look-card-img" loading="lazy" />
                  <div className="look-card-overlay" />

                  {/* Top Floating Badges */}
                  <div className="look-top-tags">
                    <span className="look-tag-aesthetic">{look.aesthetic}</span>
                    <button
                      type="button"
                      className={`look-save-btn ${isSaved ? 'saved' : ''}`}
                      onClick={(e) => toggleSaveLook(look.id, e)}
                      title={isSaved ? 'Saved to Looks' : 'Save Look'}
                    >
                      <Heart size={15} fill={isSaved ? '#E74C3C' : 'none'} color={isSaved ? '#E74C3C' : '#FFFFFF'} />
                    </button>
                  </div>

                  {/* Hover Floating Action Bar */}
                  <div className="look-hover-action-bar">
                    <button type="button" className="btn-shop-the-look">
                      <ShoppingBag size={14} />
                      <span>Shop The Look</span>
                    </button>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="look-card-meta">
                  <div className="look-meta-header">
                    <h3 className="look-card-title">{look.title}</h3>
                    <span className="look-bundle-price">{formatCurrency(bundleTotal)}</span>
                  </div>

                  <p className="look-card-occasion">{look.occasion}</p>

                  {/* Thumbnail Swatches of included items */}
                  <div className="look-included-swatches">
                    <span className="swatches-label">Includes {look.items.length} pieces:</span>
                    <div className="swatches-thumbs-row">
                      {look.items.map((it) => (
                        <img
                          key={it.productId}
                          src={it.image}
                          alt={it.name}
                          title={`${it.name} (${formatCurrency(it.price)})`}
                          className="swatch-thumb-pic"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLooks.length === 0 && (
          <div className="looks-empty-state">
            <Sparkles size={36} color="var(--color-terracotta)" />
            <h3>No Looks Found for this Combination</h3>
            <p>Try switching to "All Aesthetics" or "All Moods" to discover our complete inspiration boards.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSelectedAesthetic('all');
                setSelectedOccasion('all');
              }}
            >
              Reset Discovery Filters
            </button>
          </div>
        )}
      </div>

      {/* Interactive Shop The Look Modal */}
      {activeLookModal && (
        <ShopTheLookModal
          look={activeLookModal}
          isOpen={Boolean(activeLookModal)}
          onClose={() => setActiveLookModal(null)}
        />
      )}
    </section>
  );
}

