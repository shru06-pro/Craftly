// src/components/common/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, Scissors, Clock } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { formatINR } from '../../utils/formatCurrency';
import {
  resolveColorwayImage,
  hasDistinctColorwayImage,
  resolveProductColor
} from '../../utils/productCustomization';
import './ProductCard.css';

/**
 * Reusable Product Card Component
 * 1. Indian Craft Pricing: Displays formatINR(price) and originalPrice
 * 2. Fully functional interactive color swatches with instant image/state preview
 * 3. Switches product image on color selection; uses closest alternative if no image exists
 * 4. Graceful image error fallback prevents broken images
 * 5. Preserves chosen color when opening QuickView or adding to bag
 * 6. Global synchronized Wishlist state with isolated click handlers
 */
export default function ProductCard({ product, onSelect }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product?.id);

  const [selectedColor, setSelectedColor] = useState(() =>
    resolveProductColor(product, product?.colorVariants?.[0])
  );
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [lastWorkingSrc, setLastWorkingSrc] = useState('');

  useEffect(() => {
    setSelectedColor(resolveProductColor(product, product?.colorVariants?.[0]));
    setFailedUrls(new Set());
  }, [product]);

  // Dynamically resolve colorway image with closest alternative and failed URL handling
  const colorwayResult = resolveColorwayImage(product, selectedColor, {
    currentImage: lastWorkingSrc,
    failedUrls,
  });
  const previewImage = colorwayResult.src;
  const isDistinctImage = hasDistinctColorwayImage(product, selectedColor);

  const handleImageError = () => {
    if (previewImage) {
      setFailedUrls((prev) => {
        const updated = new Set(prev);
        updated.add(previewImage);
        return updated;
      });
    }
  };

  const handleImageLoad = () => {
    if (previewImage && !colorwayResult.isFallback) {
      setLastWorkingSrc(previewImage);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product, selectedColor);
    } else {
      navigate(`/product/${product.id}`, { state: { selectedColor } });
    }
  };

  return (
    <article className="product-card">
      <div
        className="product-thumb-wrap"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <img
          key={previewImage}
          src={previewImage}
          alt={`${product.name} ${selectedColor?.name ? `(${selectedColor.name})` : ''}`}
          className="product-thumb"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Badges (Top Left) */}
        <div className="product-badge-group">
          {product.badge && (
            <span
              className={`product-badge-pill ${
                product.badge === 'Artisan Choice' || product.badge === 'GI Tagged'
                  ? 'terracotta'
                  : product.badge === 'Natural Dyes'
                  ? 'sage'
                  : ''
              }`}
            >
              {product.badge}
            </span>
          )}
          {product.allowsCustomMeasurements && (
            <span className="product-badge-pill terracotta" title="Bespoke sizing available">
              <Scissors size={10} style={{ display: 'inline', marginRight: '3px' }} />
              Custom Sized
            </span>
          )}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          type="button"
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          title={isFavorited ? 'Saved in wishlist' : 'Save to wishlist'}
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-body">
        {/* Artisan & Location Line */}
        <div className="product-artisan-line">
          <span className="product-location">
            <MapPin size={12} color="var(--color-terracotta)" />
            {product.artisan.studio} ({product.artisan.location.split(',')[0]?.trim() || product.artisan.location})
          </span>
          <span className="product-rating">
            <Star size={12} fill="currentColor" />
            <strong>{product.rating}</strong>
            <span style={{ color: 'var(--color-muted)' }}>({product.reviewCount})</span>
          </span>
        </div>

        {/* Product Title & Description */}
        <h3
          className="product-name"
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>
        <p className="product-desc">{product.shortDescription}</p>

        {/* Interactive Functional Color Swatches */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className="product-swatches-interactive">
            <div className="product-swatches-list" role="group" aria-label="Available color shades">
              {product.colorVariants.map((c) => {
                const isSelected = selectedColor?.name === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    className={`product-swatch-btn ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(c);
                    }}
                    title={`${c.name}${!isDistinctImage && !c.isPhotographedSample ? ' (Artisan made-to-order shade)' : ''}`}
                    aria-label={`Select ${c.name} shade`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="product-swatch-dot"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                );
              })}
            </div>

            <span className="product-swatch-label" title={selectedColor?.name}>
              {selectedColor ? selectedColor.name : `${product.colorVariants.length} shades`}
            </span>
          </div>
        )}

        {/* Lead time & details chip */}
        <div className="product-details-chips">
          <span className="lead-time-chip">
            <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
            {product.leadTime}
          </span>
          {product.materials && (
            <span className="lead-time-chip" title={product.materials}>
              {product.materials.split('with')[0]?.trim()}
            </span>
          )}
        </div>

        {/* Footer & Price in INR */}
        <div className="product-footer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="product-price">{formatINR(product.price)}</span>
            {product.originalPrice && (
              <span style={{ fontSize: '11px', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-card-action"
            onClick={handleCardClick}
          >
            {product.allowsCustomMeasurements ? 'Customize & View' : 'View Studio Piece'}
          </button>
        </div>
      </div>
    </article>
  );
}
