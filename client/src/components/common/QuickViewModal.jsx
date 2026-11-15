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
  const [showSilhouetteSample, setShowSilhouetteSample] = useState(false);

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
      setShowSilhouetteSample(false);
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
  const baseSampleName = product.colorVariants?.[0]?.name || 'Standard Shade';
  const baseSampleImage = product.colorVariants?.[0]?.image || product.image;

  // Preview Image: if user toggled silhouette view on a made-to-order item, show base sample photo with clear disclaimer
  const previewImage =
    selectedColor?.isMadeToOrder && showSilhouetteSample
      ? baseSampleImage
      : colorwayResult.src;

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
      variantId: selectedColor?.id,
      isMadeToOrder: Boolean(selectedColor?.isMadeToOrder),
      leadTime: selectedColor?.leadTime || product.leadTime,
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

          {/* Silhouette Reference Overlay if toggled */}
          {selectedColor?.isMadeToOrder && showSilhouetteSample && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                padding: '6px 10px',
                background: 'rgba(37, 32, 30, 0.88)',
                color: '#FAF7F2',
                fontSize: '11px',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)',
                textAlign: 'center',
                lineHeight: 1.3,
                zIndex: 4,
              }}
            >
              Silhouette Reference Only ({baseSampleName})<br />
              <strong style={{ color: '#D4AF37' }}>Selected Order Shade: {selectedColor.name}</strong>
            </div>
          )}

          <div className="modal-color-preview-badge">
            <span
              className="modal-color-preview-dot"
              style={{ backgroundColor: selectedColor?.hex }}
            />
            <span>
              {selectedColor?.isMadeToOrder
                ? `Made to Order: ${selectedColor?.name}`
                : colorwayResult.isDedicated
                ? `Tone: ${selectedColor?.name}`
                : `Shade: ${selectedColor?.name}`}
            </span>
          </div>

          {/* Toggle button to inspect garment silhouette for made-to-order shades */}
          {selectedColor?.isMadeToOrder && (
            <button
              type="button"
              onClick={() => setShowSilhouetteSample(!showSilhouetteSample)}
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                padding: '7px 12px',
                background: 'rgba(255, 255, 255, 0.94)',
                border: '1px solid #D8C7B5',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-espresso)',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                zIndex: 4,
              }}
            >
              {showSilhouetteSample
                ? '🎨 Return to Dye Swatch Card'
                : `📷 Inspect Cut & Silhouette (${baseSampleName})`}
            </button>
          )}
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
                    {selectedColor?.isMadeToOrder && (
                      <span
                        style={{
                          marginLeft: '6px',
                          fontSize: '10px',
                          padding: '2px 6px',
                          background: 'rgba(184, 88, 52, 0.1)',
                          color: '#B85834',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Made to Order
                      </span>
                    )}
                  </span>
                </div>

                <div className="modal-swatches-wrap">
                  {product.colorVariants.map((variant) => (
                    <button
                      key={variant.id || variant.name}
                      type="button"
                      className={`modal-swatch-btn ${selectedColor?.name === variant.name ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedColor(variant);
                        setShowSilhouetteSample(false);
                      }}
                      title={`${variant.name}${variant.isMadeToOrder ? ' (Made to Order upon commission)' : ''}`}
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

                {/* Honest artisan customization note if Made-to-Order */}
                {selectedColor?.isMadeToOrder && (
                  <div
                    className="modal-custom-shade-note"
                    style={{
                      background: '#FFF8F2',
                      borderColor: '#E8D4C4',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      marginTop: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B85834', fontWeight: 600, fontSize: '12px' }}>
                      <Clock size={13} />
                      <span>Made-to-Order Dye Commission</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '11.5px', lineHeight: 1.45, color: '#5C544F' }}>
                      {selectedColor.artisanNote ||
                        `Studio preview photography is not available for this custom shade. Handcrafted and dyed upon order by ${product.artisan.studio}.`}
                    </p>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#7E746F' }}>
                      ⏱ Atelier Lead Time: <strong>{selectedColor.leadTime || '7-10 business days'}</strong>
                    </div>
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
              ) : selectedColor?.isMadeToOrder ? (
                <>
                  Commission Made-to-Order • {formatINR(totalPrice)}
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
