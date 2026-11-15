// src/components/home/OutfitInspiration.jsx
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
import { TRENDING_AESTHETICS, SHOP_THE_LOOKS } from '../../data/mockProducts.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useWishlist } from '../../context/WishlistContext.jsx';
import ShopTheLookModal from '../common/ShopTheLookModal.jsx';
import './OutfitInspiration.css';

const OCCASION_FILTERS = [
  { id: 'all', label: 'All Moods' },
  { id: 'college', label: 'Campus & College Fits' },
  { id: 'work', label: 'Office & Workwear' },
  { id: 'festive', label: 'Festive & Weddings' },
  { id: 'casual', label: 'Everyday & Cafe Runs' },
];

export default function OutfitInspiration() {
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
    <section className="outfit-inspiration-section" id="outfit-inspiration">
      <div className="container">
        {/* Section Header */}
        <div className="outfit-header-wrap">
          <div className="outfit-badge">
            <Sparkles size={14} />
            <span>Curated Head-to-Toe Edits</span>
          </div>
          <h2 className="outfit-main-title">Outfit Inspiration — Shop the Complete Look</h2>
          <p className="outfit-subtitle">
            Curated ensembles from Indian independent boutiques and local artisans.
            Shop individual pieces or add the complete head-to-toe look to your cart with exclusive bundle savings.
          </p>
        </div>

        {/* Aesthetics Horizontal Scroll Bar */}
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

        {/* Masonry-Style Outfits Grid */}
        <div className="outfit-masonry-grid">
          {filteredLooks.map((look, index) => {
            const isSaved = savedLooks[look.id];
            const bundleTotal = look.items.reduce((s, it) => s + it.price, 0);
            const bundleOriginalTotal = look.items.reduce((s, it) => s + (it.originalPrice || it.price), 0);

            return (
              <article
                key={look.id}
                className={`outfit-card ${index % 2 === 0 ? 'tall-card' : 'standard-card'}`}
                onClick={() => setActiveLookModal(look)}
              >
                <div className="outfit-image-wrap">
                  <img
                    src={look.image}
                    alt={look.title}
                    className="outfit-img"
                    loading="lazy"
                  />
                  <div className="outfit-overlay" />

                  {/* Top floating pill tags */}
                  <div className="outfit-card-header-tags">
                    <span className="outfit-aesthetic-tag">{look.aesthetic}</span>
                    <button
                      type="button"
                      className={`outfit-save-icon-btn ${isSaved ? 'saved' : ''}`}
                      onClick={(e) => toggleSaveLook(look.id, e)}
                      aria-label="Save outfit inspiration"
                    >
                      <Heart size={16} fill={isSaved ? '#B85834' : 'none'} color={isSaved ? '#B85834' : '#FFFFFF'} />
                    </button>
                  </div>

                  {/* Bottom hover drawer: Outfit breakdown */}
                  <div className="outfit-card-footer-info">
                    <span className="outfit-card-occasion">{look.occasion}</span>
                    <h3 className="outfit-card-title">{look.title}</h3>
                    <p className="outfit-card-summary">{look.description}</p>

                    {/* Pieces Mini Avatars Preview */}
                    <div className="outfit-pieces-preview">
                      <div className="pieces-avatar-stack">
                        {look.items.slice(0, 4).map((it) => (
                          <img key={it.productId} src={it.image} alt={it.name} className="piece-mini-thumb" />
                        ))}
                      </div>
                      <span className="pieces-count-label">
                        {look.items.length} pieces • {formatCurrency(bundleTotal)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-shop-the-look"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLookModal(look);
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>Shop The Look</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Modal for full look breakdown and cart bundling */}
        {activeLookModal && (
          <ShopTheLookModal
            look={activeLookModal}
            isOpen={Boolean(activeLookModal)}
            onClose={() => setActiveLookModal(null)}
            onSelectAesthetic={(aesId) => setSelectedAesthetic(aesId)}
          />
        )}
      </div>
    </section>
  );
}

