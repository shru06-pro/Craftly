// src/components/common/QuickViewModal.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Scissors, Clock, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatINR } from '../../utils/formatCurrency';
import {
  resolveProductColor,
  resolveColorwayImage,
} from '../../utils/productCustomization';
import CustomSizingForm, { validateMeasurements } from './CustomSizingForm';
import './QuickViewModal.css';

/**
 * QuickViewModal Component
 * Reusable across every eligible product in the catalogue:
 * 1. Synchronizes initialColor with card selection
 * 2. Renders matching studio photography where available
 * 3. Shows honest artisan made-to-order customization guidance when sample shade is photographed
 * 4. Preserves Custom Dress Sizing & validation
 * 5. Saves selected color and size to CartContext
 */
export default function QuickViewModal({ product, initialColor, onClose }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product?.id);

  // Color Swatch state initialized with passed color or catalogue default
  const [selectedColor, setSelectedColor] = useState(() =>
    resolveProductColor(product, initialColor)
  );
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [lastWorkingSrc, setLastWorkingSrc] = useState('');

  // Standard Size state
  const initialSize = product?.availableSizes?.[0] || 'Standard';
  const [selectedSize, setSelectedSize] = useState(initialSize);

  // Custom Dress Sizing state
  const [isCustomSized, setIsCustomSized] = useState(false);
  const [measurements, setMeasurements] = useState({
    unit: 'in',
    bust: 36,
    waist: 30,
    hips: 40,
    shoulder: 15,
    sleeveLength: 18,
    dressLength: 44,
    preferredFit: 'Classic Regular',
    tailoringInstructions: '',
  });
  const [measurementErrors, setMeasurementErrors] = useState({});

  // Monogramming state
  const [monogramInitials, setMonogramInitials] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Sync state if product or initialColor changes
  useEffect(() => {
    if (product) {
      setSelectedColor(resolveProductColor(product, initialColor));
      setSelectedSize(product.availableSizes?.[0] || 'Standard');
      setIsCustomSized(false);
      setMeasurementErrors({});
      setFailedUrls(new Set());
    }
  }, [product, initialColor]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Price and preview calculations
  const tailoringFee = isCustomSized ? (product.tailoringFee || 350) : 0;
  const totalPrice = product.price + tailoringFee;
  const colorwayResult = resolveColorwayImage(product, selectedColor, {
    currentImage: lastWorkingSrc,
    failedUrls,
  });
  const previewImage = colorwayResult.src;
  const baseSampleName = product.colorVariants?.[0]?.name || 'Standard Shade';

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

  const handleAdd = () => {
    // Validate custom sizing if selected
    if (isCustomSized) {
      const validation = validateMeasurements(measurements);
      if (!validation.isValid) {
        setMeasurementErrors(validation.errors);
        return;
      }
      setMeasurementErrors({});
    }

    addToCart(product, {
      selectedColor,
      selectedSize: isCustomSized ? 'Custom Tailored' : selectedSize,
      isCustomSized,
      customMeasurements: isCustomSized ? measurements : null,
      monogramInitials: monogramInitials.trim(),
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`modal-wishlist-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          title={isFavorited ? 'Saved in wishlist' : 'Save to wishlist'}
        >
          <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Product Image Column with Real Visual Color Preview */}
        <div className="modal-image-col">
          <img
            key={previewImage}
            src={previewImage}
            alt={`${product.name} in ${selectedColor?.name || 'Standard'}`}
            className="modal-product-img"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          <div className="modal-color-preview-badge">
            <span
              className="modal-color-preview-dot"
              style={{ backgroundColor: selectedColor?.hex }}
            />
            <span>
              {colorwayResult.isDedicated
                ? `Tone: ${selectedColor?.name}`
                : `Shade: ${selectedColor?.name}${colorwayResult.alternativeColor ? ` (Preview: ${colorwayResult.alternativeColor.name})` : ''}`}
            </span>
          </div>
        </div>

        {/* Content & Options Column */}
        <div className="modal-content-col">
          <div>
            <div className="modal-kicker">
              {product.categoryName} • {product.artisan.state}
            </div>
            <h2 className="modal-title">{product.name}</h2>

            {/* Artisan Studio Info */}
            <div className="modal-artisan-box">
              <img
                src={product.artisan.avatar}
                alt={product.artisan.name}
                className="modal-artisan-avatar"
              />
              <div className="modal-artisan-text">
                <strong>Handcrafted by {product.artisan.name}</strong>
                <span>{product.artisan.studio} • {product.artisan.location}</span>
              </div>
            </div>

            <p className="modal-desc">{product.shortDescription}</p>

            {/* 1. Color Swatches with Active Ring and Live Garment Color Preview */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="modal-options-group">
                <div className="modal-options-title">
                  <span>Artisan Dye Tone:</span>
                  <span style={{ color: 'var(--color-terracotta)', textTransform: 'none' }}>
                    {selectedColor?.name}
                  </span>
                </div>

                <div className="modal-swatches-wrap">
                  {product.colorVariants.map((variant) => (
                    <button
                      key={variant.name}
                      type="button"
                      className={`modal-swatch-btn ${selectedColor?.name === variant.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(variant)}
                      title={variant.name}
                      aria-label={`Select dye tone ${variant.name}`}
                    >
                      <span
                        className="modal-swatch-circle"
                        style={{ backgroundColor: variant.hex }}
                      />
                      <span>{variant.name}</span>
                    </button>
                  ))}
                </div>

                {/* Honest artisan customization note if using alternative or closest sample */}
                {colorwayResult.isAlternative && (
                  <div className="modal-custom-shade-note">
                    ℹ️ Studio sample shown in <strong>{colorwayResult.alternativeColor?.name || baseSampleName}</strong> (closest available match). Selecting <strong>{selectedColor.name}</strong> is an artisan made-to-order option crafted in natural dye vats by {product.artisan.studio}.
                  </div>
                )}
              </div>
            )}

            {/* 2. Sizing Selection & Custom Dress Sizing */}
            {product.availableSizes && (
              <div className="modal-options-group">
                <div className="modal-options-title">
                  <span>Select Size:</span>
                  {product.allowsCustomMeasurements && (
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'none' }}>
                      Standard or Custom Fit
                    </span>
                  )}
                </div>

                {!isCustomSized && (
                  <div className="modal-sizes-wrap">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`modal-size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Sizing Toggle Button */}
                {product.allowsCustomMeasurements && (
                  <div>
                    <button
                      type="button"
                      className={`custom-size-toggle-btn ${isCustomSized ? 'active' : ''}`}
                      onClick={() => setIsCustomSized(!isCustomSized)}
                    >
                      <Scissors size={13} />
                      {isCustomSized
                        ? '✓ Using Bespoke Measurements (Click to switch back to standard sizes)'
                        : 'My size isn’t available? Customize it (+₹' + (product.tailoringFee || 350) + ')'}
                    </button>

                    {/* Expandable Custom Sizing Form */}
                    {isCustomSized && (
                      <CustomSizingForm
                        measurements={measurements}
                        onChange={setMeasurements}
                        errors={measurementErrors}
                        tailoringFee={product.tailoringFee || 350}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Custom Monogram (if customizable) */}
            {product.customizable && (
              <div className="modal-options-group">
                <div className="modal-options-title">
                  <span>Embroidered Monogram Initials (Optional):</span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Initials (e.g. P.S.)"
                  value={monogramInitials}
                  onChange={(e) => setMonogramInitials(e.target.value.toUpperCase())}
                  className="modal-monogram-input"
                />
              </div>
            )}

            {/* Trust highlights */}
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-muted)', marginTop: '8px' }}>
              <span><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> Dispatch: {product.leadTime}</span>
              <span><ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} /> 100% Verified Indian Handloom</span>
            </div>
          </div>

          {/* Modal Price & Add to Bag Footer */}
          <div className="modal-footer">
            <div className="modal-price-box">
              <span className="modal-price">{formatINR(totalPrice)}</span>
              {isCustomSized && (
                <span className="modal-tailoring-fee-note">
                  Includes +{formatINR(tailoringFee)} custom tailoring
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleAdd}
            >
              {isAdded ? (
                <>
                  <Check size={16} /> Added to Studio Bag!
                </>
              ) : (
                <>
                  Add to Studio Bag • {formatINR(totalPrice)}
                </>
              )}
            </button>
          </div>

          <div className="modal-pdp-link-row">
            <Link to={`/product/${product.id}`} className="modal-pdp-link" onClick={onClose}>
              View Full Studio Story & Detailed Specifications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
