import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  Scissors,
  Tag,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatCurrency';
import { getProductPreviewImage, getCraftlyFallbackSvg } from '../utils/productCustomization';
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    tailoringTotal,
    shippingFee,
    discountAmount,
    grandTotal,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  // Group cart items by artisan / store
  const storeGroups = cartItems.reduce((groups, item) => {
    const storeName = item.product.artisan?.studio || item.product.artisan?.studioName || 'Atelier Guild';
    const storeLocation = item.product.artisan?.location || 'India';
    if (!groups[storeName]) {
      groups[storeName] = {
        name: storeName,
        location: storeLocation,
        items: [],
      };
    }
    groups[storeName].items.push(item);
    return groups;
  }, {});

  const storeCount = Object.keys(storeGroups).length;

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty-page">
        <div className="cart-empty-card">
          <ShoppingBag size={56} color="var(--color-terracotta)" />
          <h1 className="cart-empty-title">Your Studio Bag is Empty</h1>
          <p className="cart-empty-subtitle">
            Explore authentic handloom kurtas, vegetable-tanned leather, and heirloom jewellery handcrafted by India’s finest master artisans.
          </p>
          <Link to="/shop" className="btn-primary cart-empty-btn">
            <span>Explore Curated Collections</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-root">
      <div className="container">
        <div className="cart-page-header">
          <h1 className="cart-title">Your Studio Bag</h1>
          <span className="cart-meta-count">
            {cartCount} {cartCount === 1 ? 'creation' : 'creations'} across {storeCount} {storeCount === 1 ? 'independent atelier' : 'independent ateliers'}
          </span>
        </div>

        <div className="cart-layout-grid">
          {/* Left Column: Multi-Store Grouped Items */}
          <div className="cart-items-col">
            {Object.values(storeGroups).map((store) => (
              <div key={store.name} className="cart-store-group">
                <div className="cart-store-header">
                  <div className="cart-store-info">
                    <Store size={16} color="var(--color-terracotta)" />
                    <span className="cart-store-name">{store.name}</span>
                    <span className="cart-store-loc">• {store.location}</span>
                  </div>
                  <span className="cart-store-tag">Independent Atelier Sub-Order</span>
                </div>

                <div className="cart-store-items-list">
                  {store.items.map((item) => {
                    const previewImg = getProductPreviewImage(item.product, item.selectedColor);
                    const itemTotal = (item.product.price + (item.tailoringFee || 0)) * item.quantity;

                    return (
                      <div key={item.cartItemId} className="cart-item-row">
                        {/* Thumbnail */}
                        <div className="cart-item-img-wrap">
                          <img
                            src={previewImg}
                            alt={item.product.name}
                            className="cart-item-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getCraftlyFallbackSvg(item.product);
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="cart-item-details">
                          <div className="cart-item-title-row">
                            <h3 className="cart-item-title">{item.product.name}</h3>
                            <button
                              type="button"
                              className="cart-remove-btn"
                              onClick={() => removeFromCart(item.cartItemId)}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="cart-item-specs-row">
                            <span className="spec-badge">
                              <span
                                className="color-dot"
                                style={{ backgroundColor: item.selectedColor?.hex || '#FAF6EE' }}
                              />
                              {item.selectedColor?.name || 'Standard'}
                            </span>
                            {item.isMadeToOrder && (
                              <span className="spec-badge" style={{ background: 'rgba(184, 88, 52, 0.1)', color: '#B85834', borderColor: '#E8D4C4', fontWeight: 600 }}>
                                Made to Order • {item.leadTime?.replace(/^Made to Order\s*\(?/i, '').replace(/\)$/, '') || '7-10 business days'}
                              </span>
                            )}
                            <span className="spec-badge">Size: {item.selectedSize}</span>
                            {item.isCustomSized && (
                              <span className="spec-badge custom-tag">
                                <Scissors size={11} style={{ marginRight: '3px' }} />
                                Custom Dress Sizing (+{formatINR(item.tailoringFee || 350)})
                              </span>
                            )}
                          </div>

                          {/* Custom Measurements Snapshot if present */}
                          {item.isCustomSized && item.customMeasurements && (
                            <div className="cart-measurements-preview">
                              <span>Bust: {item.customMeasurements.bust}"</span>
                              <span>Waist: {item.customMeasurements.waist}"</span>
                              <span>Hips: {item.customMeasurements.hips}"</span>
                              <span>Length: {item.customMeasurements.garmentLength}"</span>
                              {item.customMeasurements.fitPreference && (
                                <span>Fit: {item.customMeasurements.fitPreference}</span>
                              )}
                            </div>
                          )}

                          {item.monogramInitials && (
                            <div className="cart-monogram-line">
                              Personal Monogram: <strong>"{item.monogramInitials}"</strong>
                            </div>
                          )}

                          {/* Quantity & Price Row */}
                          <div className="cart-item-bottom-row">
                            <div className="cart-qty-picker">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="qty-num">{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="cart-item-price-col">
                              <span className="cart-item-total-price">{formatINR(itemTotal)}</span>
                              {item.quantity > 1 && (
                                <span className="cart-item-unit-price">
                                  {formatINR(item.product.price + (item.tailoringFee || 0))} each
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h2 className="summary-title">Summary</h2>

              {/* Coupon Form */}
              <div className="cart-coupon-section">
                {appliedCoupon ? (
                  <div className="applied-coupon-pill">
                    <div className="applied-coupon-info">
                      <Tag size={14} color="var(--color-terracotta)" />
                      <span><strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.percent ? `${appliedCoupon.percent}% off` : `₹${appliedCoupon.flatAmount} off`})</span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-coupon"
                      onClick={removeCoupon}
                      title="Remove coupon"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="coupon-form">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. CRAFTLY10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="coupon-input"
                    />
                    <button type="submit" className="coupon-submit-btn">
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="coupon-msg error">{couponError}</p>}
                {couponSuccess && <p className="coupon-msg success">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="summary-lines-list">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>

                {tailoringTotal > 0 && (
                  <div className="summary-line">
                    <span>Bespoke Tailoring Fees</span>
                    <span>+{formatINR(tailoringTotal)}</span>
                  </div>
                )}

                <div className="summary-line">
                  <span>Shipping & Delivery</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: 'var(--color-terracotta)' }}>FREE</strong> : formatINR(shippingFee)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-line discount">
                    <span>Coupon Discount</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-total-divider" />

                <div className="summary-line grand-total">
                  <span>Grand Total</span>
                  <span className="total-amount">{formatINR(grandTotal)}</span>
                </div>
                <span className="inclusive-tax-note">Inclusive of all Indian artisan taxes (GST)</span>
              </div>

              <button
                type="button"
                className="btn-primary checkout-proceed-btn"
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="cart-guarantees-list">
                <div className="guarantee-item">
                  <ShieldCheck size={14} color="var(--color-terracotta)" />
                  <span>100% Genuine Handcrafted GI Provenance</span>
                </div>
                <div className="guarantee-item">
                  <Store size={14} color="var(--color-terracotta)" />
                  <span>Direct Artisan Split Fulfilment with Milestones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

