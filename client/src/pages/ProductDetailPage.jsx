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
  RotateCcw,
  Store,
  UploadCloud,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatCurrency';
import {
  resolveColorwayImage,
  hasDistinctColorwayImage,
  resolveProductColor
} from '../utils/productCustomization';
import CustomSizingForm, { validateMeasurements } from '../components/common/CustomSizingForm';
import AuthModal from '../components/common/AuthModal';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState(() =>
    resolveProductColor(product, location.state?.selectedColor || product?.colorVariants?.[0])
  );
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [lastWorkingSrc, setLastWorkingSrc] = useState('');
  const [showSilhouetteSample, setShowSilhouetteSample] = useState(false);

  const [selectedSize, setSelectedSize] = useState(() =>
    product?.availableSizes?.[0] || 'Standard'
  );

  // Predefined Custom Sizing state
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
  const [monogramInitials, setMonogramInitials] = useState('');
  const [isAddedToast, setIsAddedToast] = useState(false);

  // Special Customization Inquiry State
  const [isSpecialRequestOpen, setIsSpecialRequestOpen] = useState(false);
  const [specialRequestTitle, setSpecialRequestTitle] = useState('');
  const [specialRequestDesc, setSpecialRequestDesc] = useState('');
  const [specialRequestNotes, setSpecialRequestNotes] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [specialRequestStatus, setSpecialRequestStatus] = useState(null); // 'submitting', 'success', 'error'
  const [specialRequestFeedback, setSpecialRequestFeedback] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(resolveProductColor(product, location.state?.selectedColor || product?.colorVariants?.[0]));
      setSelectedSize(product.availableSizes?.[0] || 'Standard');
      setIsCustomSized(false);
      setMeasurementErrors({});
      setFailedUrls(new Set());
      setShowSilhouetteSample(false);
      window.scrollTo(0, 0);
    }
  }, [product, location.state]);

  if (!product) {
    return (
      <div className="pdp-not-found container">
        <div className="pdp-not-found-card">
          <h2>Studio Piece Not Found</h2>
          <p>The artisan piece you are looking for is not in our active catalogue or has been relocated.</p>
          <Link to="/shop" className="btn-primary">
            <ArrowLeft size={16} /> Return to Curated Shop
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
  const baseSampleName = product.colorVariants?.[0]?.name || 'Standard Shade';
  const baseSampleImage = product.colorVariants?.[0]?.image || product.image;

  // Preview Image: if user toggled silhouette view on a made-to-order item, show base sample photo with clear disclaimer
  const previewImage =
    selectedColor?.isMadeToOrder && showSilhouetteSample
      ? baseSampleImage
      : colorwayResult.src;
  const isDistinctImage = hasDistinctColorwayImage(product, selectedColor);
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
      variantId: selectedColor?.id,
      isMadeToOrder: Boolean(selectedColor?.isMadeToOrder),
      leadTime: selectedColor?.leadTime || product.leadTime,
      selectedSize: isCustomSized ? 'Custom Tailored' : selectedSize,
      isCustomSized,
      customMeasurements: isCustomSized ? measurements : null,
      monogramInitials: monogramInitials.trim(),
      quantity: 1,
    });

    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2200);
  };

  // Upload reference image handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:4000/v1/customization/upload-reference', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to upload image');

      const imageUrl = `http://localhost:4000${json.data.url}`;
      setReferenceImages((prev) => [...prev, imageUrl]);
    } catch (err) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Special Customization Request
  const handleSubmitSpecialRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!specialRequestTitle.trim() || !specialRequestDesc.trim()) {
      setSpecialRequestFeedback('Please provide a title and detailed description for your customization request.');
      setSpecialRequestStatus('error');
      return;
    }

    setSpecialRequestStatus('submitting');
    try {
      const res = await fetch('http://localhost:4000/v1/customization/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          title: specialRequestTitle.trim(),
          description: specialRequestDesc.trim(),
          customerNotes: specialRequestNotes.trim() || null,
          referenceImages,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Submission failed');

      setSpecialRequestStatus('success');
      setSpecialRequestFeedback('Your bespoke inquiry has been delivered directly to the artisan atelier. You can track their review in your Customer Account.');
    } catch (err) {
      setSpecialRequestStatus('error');
      setSpecialRequestFeedback(err.message || 'Failed to submit customization inquiry.');
    }
  };

  // Resolve store ID for linking
  const storeId =
    product.id === 'prod-1' ? 'artisan-chikankari' :
    product.id === 'prod-2' ? 'artisan-bagru' :
    product.id === 'prod-3' ? 'artisan-leather' :
    product.id === 'prod-4' ? 'artisan-jewelry' :
    product.id === 'prod-5' ? 'artisan-leather' : 'artisan-pottery';

  return (
    <div className="pdp-page">
      <div className="container">
        {/* Navigation Breadcrumbs */}
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/shop" className="breadcrumb-link">Shop</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/shop?category=${product.category}`} className="breadcrumb-link">{product.categoryName}</Link>
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

              {/* Silhouette Reference Overlay if toggled */}
              {selectedColor?.isMadeToOrder && showSilhouetteSample && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    right: '16px',
                    padding: '8px 12px',
                    background: 'rgba(37, 32, 30, 0.90)',
                    color: '#FAF7F2',
                    fontSize: '12px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)',
                    textAlign: 'center',
                    lineHeight: 1.35,
                    zIndex: 4,
                  }}
                >
                  Silhouette Reference Only ({baseSampleName})<br />
                  <strong style={{ color: '#D4AF37' }}>Selected Order Shade: {selectedColor.name}</strong>
                </div>
              )}

              {/* Dye Tone preview pill */}
              <div className="pdp-color-badge">
                <span
                  className="pdp-color-badge-dot"
                  style={{ backgroundColor: selectedColor?.hex }}
                />
                <span>
                  {selectedColor?.isMadeToOrder
                    ? `Made to Order: ${selectedColor?.name}`
                    : isDistinctImage
                    ? `Studio Sample: ${selectedColor?.name}`
                    : `Tone: ${selectedColor?.name}`}
                </span>
              </div>

              {/* Toggle button to inspect garment silhouette for made-to-order shades */}
              {selectedColor?.isMadeToOrder && (
                <button
                  type="button"
                  onClick={() => setShowSilhouetteSample(!showSilhouetteSample)}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    padding: '8px 14px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #D8C7B5',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-espresso)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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

            {/* Thumbnail swatch gallery */}
            {product.colorVariants && product.colorVariants.length > 1 && (
              <div className="pdp-thumbnails-strip">
                {product.colorVariants.map((variant) => {
                  const variantResult = resolveColorwayImage(product, variant, { failedUrls });
                  const variantImg = variantResult.src;
                  const isSelected = selectedColor?.name === variant.name;
                  return (
                    <button
                      key={variant.id || variant.name}
                      type="button"
                      className={`pdp-thumb-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedColor(variant);
                        setShowSilhouetteSample(false);
                      }}
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

              {/* Artisan Profile Box with Link to Store Profile */}
              <Link to={`/stores/${storeId}`} className="pdp-artisan-card-link" title="Visit artisan store profile">
                <div className="pdp-artisan-card">
                  <img
                    src={product.artisan.avatar}
                    alt={product.artisan.name}
                    className="pdp-artisan-avatar"
                  />
                  <div className="pdp-artisan-info">
                    <strong>Master Artisan: {product.artisan.name}</strong>
                    <span>
                      <Store size={12} color="var(--color-terracotta)" style={{ display: 'inline', marginRight: '3px' }} />
                      {product.artisan.studio} • {product.artisan.location}
                    </span>
                  </div>
                  <span className="pdp-artisan-view-store">View Store &rarr;</span>
                </div>
              </Link>

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
                  <span className="pdp-option-current">
                    {selectedColor?.name}
                    {selectedColor?.isMadeToOrder && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          padding: '2px 8px',
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

                <div className="pdp-swatches-list">
                  {product.colorVariants.map((variant) => {
                    const isSelected = selectedColor?.name === variant.name;
                    return (
                      <button
                        key={variant.id || variant.name}
                        type="button"
                        className={`pdp-swatch-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedColor(variant);
                          setShowSilhouetteSample(false);
                        }}
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

                {selectedColor?.isMadeToOrder && (
                  <div
                    className="pdp-artisan-notice"
                    style={{
                      background: '#FFF8F2',
                      borderColor: '#E8D4C4',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      marginTop: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B85834', fontWeight: 600, fontSize: '13px' }}>
                      <Clock size={14} />
                      <span>Made-to-Order Dye Commission</span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', lineHeight: 1.5, color: '#5C544F' }}>
                      {selectedColor.artisanNote ||
                        `Studio preview photography is not available for this custom dye shade. Handcrafted and dyed upon order by ${product.artisan.studio}. An unrelated garment photo is never substituted.`}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#7E746F' }}>
                      ⏱ Atelier Lead Time: <strong>{selectedColor.leadTime || '7-10 business days'}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sizing & Predefined Custom Tailoring Options */}
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

                {/* Predefined Custom Sizing Box */}
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
                        : `Request Bespoke Made-to-Measure Tailoring (+${formatINR(product.tailoringFee || 350)})`}
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

            {/* Special Customization Request Collapsible Form (Phase 7 Requirement) */}
            <div className="pdp-special-custom-box">
              <button
                type="button"
                className="btn-special-custom-toggle"
                onClick={() => setIsSpecialRequestOpen(!isSpecialRequestOpen)}
              >
                <Sparkles size={15} color="var(--color-terracotta)" />
                <span>Have a Unique Design Idea? Submit a Bespoke Customization Request</span>
                <span className="toggle-chevron">{isSpecialRequestOpen ? '▲' : '▼'}</span>
              </button>

              {isSpecialRequestOpen && (
                <div className="special-custom-form-wrap">
                  {specialRequestStatus === 'success' ? (
                    <div className="special-custom-success">
                      <CheckCircle2 size={32} color="var(--color-terracotta)" />
                      <h4>Bespoke Request Delivered</h4>
                      <p>{specialRequestFeedback}</p>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          setSpecialRequestStatus(null);
                          setSpecialRequestTitle('');
                          setSpecialRequestDesc('');
                          setSpecialRequestNotes('');
                          setReferenceImages([]);
                        }}
                      >
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSpecialRequest} className="special-custom-form">
                      <p className="special-custom-intro">
                        Connect directly with <strong>{product.artisan.name}</strong> at <strong>{product.artisan.studio}</strong>.
                        Request alternative border motifs, specific sleeve cuts, or personalized heritage embroidery.
                      </p>

                      <div className="form-group">
                        <label>Customization Request Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Extended Kurta Length with Zari Thread Work"
                          value={specialRequestTitle}
                          onChange={(e) => setSpecialRequestTitle(e.target.value)}
                          className="special-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Detailed Specifications *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Describe the desired changes, preferred thread colors, or bespoke sizing adjustments..."
                          value={specialRequestDesc}
                          onChange={(e) => setSpecialRequestDesc(e.target.value)}
                          className="special-textarea"
                        />
                      </div>

                      <div className="form-group">
                        <label>Occasion / Special Notes</label>
                        <input
                          type="text"
                          placeholder="e.g., Wedding ceremony in December, needed by Nov 20"
                          value={specialRequestNotes}
                          onChange={(e) => setSpecialRequestNotes(e.target.value)}
                          className="special-input"
                        />
                      </div>

                      {/* Reference Image Upload */}
                      <div className="form-group">
                        <label>Upload Reference Photos (Inspiration / Sketches)</label>
                        <div className="image-upload-row">
                          <label className="image-upload-dropzone">
                            <UploadCloud size={20} color="var(--color-terracotta)" />
                            <span>{isUploadingImage ? 'Uploading photo...' : 'Choose JPG / PNG / WEBP reference image'}</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleImageUpload}
                              disabled={isUploadingImage}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>

                        {referenceImages.length > 0 && (
                          <div className="uploaded-previews-list">
                            {referenceImages.map((imgUrl, i) => (
                              <img key={i} src={imgUrl} alt={`Reference ${i + 1}`} className="uploaded-thumb" />
                            ))}
                          </div>
                        )}
                      </div>

                      {specialRequestStatus === 'error' && (
                        <div className="special-error-line">
                          <AlertCircle size={14} />
                          <span>{specialRequestFeedback}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={specialRequestStatus === 'submitting'}
                        className="btn-primary special-submit-btn"
                      >
                        <Send size={14} />
                        <span>
                          {specialRequestStatus === 'submitting'
                            ? 'Delivering to Atelier...'
                            : `Send Request to ${product.artisan.studio}`}
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

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
                ) : selectedColor?.isMadeToOrder ? (
                  <>
                    <ShoppingBag size={18} /> Commission Made-to-Order • {formatINR(totalPrice)}
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}
