import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Star,
  Clock,
  Scissors,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Check,
  Truck,
  RotateCcw
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatCurrency';
import {
  resolveColorwayImage,
  hasDistinctColorwayImage,
  resolveProductColor
} from '../utils/productCustomization';
import CustomSizingForm, { validateMeasurements } from '../components/common/CustomSizingForm';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Find product by id
  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  // Synchronized color state (initializes with location.state passed from card if present)
  const [selectedColor, setSelectedColor] = useState(() =>
    resolveProductColor(product, location.state?.selectedColor || product?.colorVariants?.[0])
  );
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [lastWorkingSrc, setLastWorkingSrc] = useState('');

  // Size state
  const [selectedSize, setSelectedSize] = useState(() =>
    product?.availableSizes?.[0] || 'Standard'
  );

  // Custom sizing state
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
  const [isAddedToast, setIsAddedToast] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(resolveProductColor(product, location.state?.selectedColor || product?.colorVariants?.[0]));
      setSelectedSize(product.availableSizes?.[0] || 'Standard');
      setIsCustomSized(false);
      setMeasurementErrors({});
      setFailedUrls(new Set());
      window.scrollTo(0, 0);
    }
  }, [product, location.state]);

  if (!product) {
    return (
      <div className="pdp-not-found container">
        <div className="pdp-not-found-card">
          <h2>Studio Piece Not Found</h2>
          <p>The artisan piece you are looking for is not in our active catalogue or has been relocated.</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} /> Return to Curated Collections
          </Link>
        </div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const colorwayResult = resolveColorwayImage(product, selectedColor, {
    currentImage: lastWorkingSrc,
    failedUrls,
  });
  const previewImage = colorwayResult.src;
  const isDistinctImage = hasDistinctColorwayImage(product, selectedColor);
  const baseSampleName = product.colorVariants?.[0]?.name || 'Standard Shade';
  const tailoringFee = isCustomSized ? (product.tailoringFee || 350) : 0;
  const totalPrice = product.price + tailoringFee;

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

  const handleAddToBag = () => {
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

    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2200);
  };

  return (
    <div className="pdp-page">
      <div className="container">
        {/* Navigation Breadcrumbs */}
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/#collections" className="breadcrumb-link">{product.categoryName}</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="pdp-grid">
          {/* Left Column: Visual Color Preview Stage */}
          <div className="pdp-gallery-col">
            <div className="pdp-image-stage">
              <img
                key={previewImage}
                src={previewImage}
                alt={`${product.name} in ${selectedColor?.name || 'Standard'}`}
                className="pdp-main-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {/* Badges */}
              <div className="pdp-badge-group">
                {product.badge && (
                  <span className="product-badge-pill terracotta">{product.badge}</span>
                )}
                {product.allowsCustomMeasurements && (
                  <span className="product-badge-pill sage">
                    <Scissors size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    Bespoke Tailoring
                  </span>
                )}
              </div>

              {/* Floating Wishlist Heart Button */}
              <button
                type="button"
                className={`pdp-float-wishlist-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                title={isFavorited ? 'Saved in wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>

              {/* Dye Tone preview pill */}
              <div className="pdp-color-badge">
                <span
                  className="pdp-color-badge-dot"
                  style={{ backgroundColor: selectedColor?.hex }}
                />
                <span>
                  {isDistinctImage
                    ? `Studio Sample: ${selectedColor?.name}`
                    : `Made-to-Order Dye: ${selectedColor?.name}`}
                </span>
              </div>
            </div>

            {/* Thumbnail swatch gallery */}
            {product.colorVariants && product.colorVariants.length > 1 && (
              <div className="pdp-thumbnails-strip">
                {product.colorVariants.map((variant) => {
                  const variantResult = resolveColorwayImage(product, variant, { failedUrls });
                  const variantImg = variantResult.src;
                  const isSelected = selectedColor?.name === variant.name;
                  return (
                    <button
                      key={variant.name}
                      type="button"
                      className={`pdp-thumb-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedColor(variant)}
                      title={variant.name}
                    >
                      <img
                        src={variantImg}
                        alt={variant.name}
                        className="pdp-thumb-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = lastWorkingSrc || previewImage;
                        }}
                      />
                      <span className="pdp-thumb-caption">{variant.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Artisan Story & Customization Controls */}
          <div className="pdp-details-col">
            <div className="pdp-header">
              <div className="pdp-kicker">
                <Sparkles size={13} color="var(--color-terracotta)" />
                <span>{product.categoryName} • {product.artisan.state}</span>
              </div>
              <h1 className="pdp-title">{product.name}</h1>

              {/* Artisan Profile Box */}
              <div className="pdp-artisan-card">
                <img
                  src={product.artisan.avatar}
                  alt={product.artisan.name}
                  className="pdp-artisan-avatar"
                />
                <div className="pdp-artisan-info">
                  <strong>Master Craftsman: {product.artisan.name}</strong>
                  <span>{product.artisan.studio} • {product.artisan.location}</span>
                </div>
              </div>

              {/* Rating & reviews */}
              <div className="pdp-meta-row">
                <div className="pdp-rating">
                  <Star size={15} fill="currentColor" color="#b3820a" />
                  <strong>{product.rating}</strong>
                  <span>({product.reviewCount} verified collector reviews)</span>
                </div>
                <div className="pdp-lead-time">
                  <Clock size={14} color="var(--color-terracotta)" />
                  <span>Lead Time: {product.leadTime}</span>
                </div>
              </div>

              {/* Price in INR */}
              <div className="pdp-price-row">
                <span className="pdp-price">{formatINR(totalPrice)}</span>
                {product.originalPrice && (
                  <span className="pdp-orig-price">{formatINR(product.originalPrice)}</span>
                )}
                {product.originalPrice && (
                  <span className="pdp-discount-tag">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            <p className="pdp-desc">{product.shortDescription}</p>

            {/* Color Swatch Options */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <label className="pdp-option-label">Artisan Natural Dye Shade:</label>
                  <span className="pdp-option-current">{selectedColor?.name}</span>
                </div>

                <div className="pdp-swatches-list">
                  {product.colorVariants.map((variant) => {
                    const isSelected = selectedColor?.name === variant.name;
                    return (
                      <button
                        key={variant.name}
                        type="button"
                        className={`pdp-swatch-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedColor(variant)}
                        aria-label={`Select shade ${variant.name}`}
                      >
                        <span
                          className="pdp-swatch-circle"
                          style={{ backgroundColor: variant.hex }}
                        />
                        <span className="pdp-swatch-text">{variant.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Honest made-to-order notice for non-photographed variants or closest alternative previews */}
                {colorwayResult.isAlternative && (
                  <div className="pdp-artisan-notice">
                    ℹ️ Studio sample shown in <strong>{colorwayResult.alternativeColor?.name || baseSampleName}</strong> (closest available shade). Selecting <strong>{selectedColor.name}</strong> is an authentic artisan made-to-order color crafted in certified natural dye vats by {product.artisan.studio}.
                  </div>
                )}
              </div>
            )}

            {/* Sizing & Bespoke Tailoring Options */}
            {product.availableSizes && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <label className="pdp-option-label">Select Standard Size:</label>
                  {product.allowsCustomMeasurements && (
                    <span className="pdp-bespoke-hint">Bespoke sizing available below</span>
                  )}
                </div>

                {!isCustomSized && (
                  <div className="pdp-sizes-list">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Sizing Toggle */}
                {product.allowsCustomMeasurements && (
                  <div className="pdp-custom-sizing-box">
                    <button
                      type="button"
                      className={`btn-toggle-custom ${isCustomSized ? 'active' : ''}`}
                      onClick={() => setIsCustomSized(!isCustomSized)}
                    >
                      <Scissors size={14} />
                      {isCustomSized
                        ? 'Switch back to Standard Sizing'
                        : `Request Bespoke Custom Tailoring (+${formatINR(product.tailoringFee || 350)})`}
                    </button>

                    {isCustomSized && (
                      <div className="pdp-sizing-form-wrap">
                        <CustomSizingForm
                          measurements={measurements}
                          onChange={setMeasurements}
                          errors={measurementErrors}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Monogram Option */}
            {product.customizable && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <label className="pdp-option-label">Artisan Monogram Initials:</label>
                  <span className="pdp-bespoke-hint">Embroidered on hem/pocket</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. S.K. (up to 4 letters)"
                  value={monogramInitials}
                  maxLength={4}
                  onChange={(e) => setMonogramInitials(e.target.value.toUpperCase())}
                  className="pdp-monogram-input"
                />
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="pdp-actions-row">
              <button
                type="button"
                className="pdp-add-bag-btn"
                onClick={handleAddToBag}
              >
                {isAddedToast ? (
                  <>
                    <Check size={18} /> Added to Studio Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Studio Bag • {formatINR(totalPrice)}
                  </>
                )}
              </button>

              <button
                type="button"
                className={`pdp-wishlist-action-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                <span>{isFavorited ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>

            {/* Trust and delivery guarantees */}
            <div className="pdp-trust-grid">
              <div className="pdp-trust-item">
                <Truck size={16} color="var(--color-terracotta)" />
                <span>Free Insured Handloom Delivery across India</span>
              </div>
              <div className="pdp-trust-item">
                <ShieldCheck size={16} color="var(--color-sage)" />
                <span>85%+ Proceeds Direct to Weavers & Artisans</span>
              </div>
              <div className="pdp-trust-item">
                <RotateCcw size={16} color="var(--color-terracotta)" />
                <span>Free Tailoring Adjustments Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
