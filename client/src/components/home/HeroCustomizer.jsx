// src/components/home/HeroCustomizer.jsx
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Scissors, Check, Shield } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatCurrency';
import { resolveColorwayImage } from '../../utils/productCustomization';
import './HeroCustomizer.css';

/**
 * HeroCustomizer Component
 * 1. Consistent Model Photography: Genuine studio colorway variations
 * 2. Swatches update selected color state, active border highlight, and color name
 * 3. Saves selected color to CartContext
 */
export default function HeroCustomizer() {
  const heroProduct = MOCK_PRODUCTS[0]; // Hand-Embroidered Chikankari Muslin Kurta
  const { addToCart } = useCart();

  const [monogramInitials, setMonogramInitials] = useState('P.S.');
  const [selectedSwatch, setSelectedSwatch] = useState(heroProduct.colorVariants[0]);
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [lastWorkingSrc, setLastWorkingSrc] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  const colorwayResult = resolveColorwayImage(heroProduct, selectedSwatch, {
    currentImage: lastWorkingSrc,
    failedUrls,
  });
  const previewImage = colorwayResult.src;

  const handleImageError = () => {
    if (previewImage) {
      setFailedUrls((prev) => {
        const next = new Set(prev);
        next.add(previewImage);
        return next;
      });
    }
  };

  const handleImageLoad = () => {
    if (previewImage && !colorwayResult.isFallback) {
      setLastWorkingSrc(previewImage);
    }
  };

  const handleInitialsChange = (e) => {
    const val = e.target.value.toUpperCase().slice(0, 4);
    setMonogramInitials(val);
  };

  const handleAddToBag = () => {
    addToCart(heroProduct, {
      selectedColor: selectedSwatch,
      selectedSize: 'M',
      monogramInitials: monogramInitials || '',
      quantity: 1,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  return (
    <section className="hero-customizer-section" id="customizer">
      <div className="container hero-layout-grid">
        {/* Left: Indian Marketplace Brand Ethos */}
        <div>
          <div className="hero-editorial-badge">
            <Sparkles size={14} color="var(--color-terracotta)" />
            <span>Direct from Lucknow, Bagru & Maheshwar Ateliers</span>
          </div>

          <h1 className="hero-main-heading">
            Indian heirloom fashion, tailored to <em>your silhouette & initials</em>.
          </h1>

          <p className="hero-editorial-lead">
            Craftly connects you directly with verified Indian master artisans—from 32-stitch Lucknowi Chikankari
            embroiderers to Bagru mud-resist block printers and Maheshwari handloom weavers.
            Made to measure. Zero mass factory middlemen.
          </p>

          <div className="hero-cta-group">
            <a href="#collections" className="btn-primary">
              Explore Collections
              <ArrowRight size={16} />
            </a>
            <a href="#artisan-spotlight" className="btn-secondary">
              Meet Master Artisans
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="hero-trust-indicators">
            <div className="trust-item">
              <Scissors size={16} color="var(--color-terracotta)" />
              <span><strong>Made to Measure:</strong> Custom sleeve & bust fit</span>
            </div>
            <div className="trust-item">
              <Shield size={16} color="var(--color-sage)" />
              <span><strong>85%+ Direct to Weavers:</strong> Ethical artisan earnings</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Bespoke Studio Bench */}
        <div className="studio-bench-card" aria-label="Interactive Studio Bench">
          <div className="bench-card-header">
            <span className="bench-card-title">
              <Sparkles size={16} color="var(--color-terracotta)" />
              Interactive Chikankari Studio Bench
            </span>
            <span className="bench-card-status">Live Color & Fit</span>
          </div>

          {/* Real Visual Studio Photography Preview (Same model, pose, angle) */}
          <div className="bench-preview-stage">
            <img
              key={previewImage}
              src={previewImage}
              alt={`${heroProduct.name} in ${selectedSwatch?.name}`}
              className="bench-stage-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Live Tactile Monogram Tag Overlay */}
            <div className="tactile-monogram-tag">
              <span className="monogram-stitch-seal">
                {monogramInitials || '—'}
              </span>
              <div className="monogram-tag-text">
                <strong>Bespoke Lucknowi Cuff Monogram</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: selectedSwatch.hex,
                      display: 'inline-block',
                      border: '1px solid rgba(0,0,0,0.2)',
                    }}
                  />
                  <span>Dye Shade: <strong>{selectedSwatch.name}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Customizer Controls */}
          <div className="customizer-controls-box">
            {/* Color Swatches with Active Ring */}
            <div className="control-row">
              <span className="control-label">
                Artisan Dye Palette:
                <span className="selected-color-name-badge">{selectedSwatch.name}</span>
              </span>

              <div className="swatches-wrap">
                {heroProduct.colorVariants.map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    className={`swatch-btn ${selectedSwatch.name === swatch.name ? 'active' : ''}`}
                    onClick={() => setSelectedSwatch(swatch)}
                    title={swatch.name}
                    aria-label={`Select dye shade ${swatch.name}`}
                  >
                    <div
                      className="swatch-color-inner"
                      style={{ backgroundColor: swatch.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Embroidered Initials Input */}
            <div className="control-row" style={{ marginTop: '4px' }}>
              <span className="control-label">Embroidered Initials (Cuff):</span>
              <input
                type="text"
                value={monogramInitials}
                onChange={handleInitialsChange}
                placeholder="P.S."
                maxLength={4}
                className="monogram-input"
                aria-label="Enter bespoke monogram initials"
              />
            </div>
          </div>

          {/* Price & CTA in INR */}
          <div className="bench-action-line">
            <div className="bench-price-wrap">
              <div className="bench-price-row">
                <span className="bench-price">{formatINR(heroProduct.price)}</span>
                <span className="bench-original-price">{formatINR(heroProduct.originalPrice)}</span>
              </div>
              <span className="bench-promo-note">✓ Complimentary Lucknow Initial Monogramming</span>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleAddToBag}
            >
              {addedToast ? (
                <>
                  <Check size={16} /> Added to Bag!
                </>
              ) : (
                <>
                  Add Bespoke Piece <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
