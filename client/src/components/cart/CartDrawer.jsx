// src/components/cart/CartDrawer.jsx
import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Scissors } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatCurrency';
import { getProductPreviewImage, getCraftlyFallbackSvg } from '../../utils/productCustomization';
import CheckoutModal from './CheckoutModal';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    isCartOpen,
    setIsCartOpen,
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

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg(res);
    if (res.success) setCouponCode('');
  };

  const amountNeededForFreeShipping = Math.max(0, 1499 - subtotal);

  return (
    <>
      <div className="cart-overlay-backdrop" onClick={() => setIsCartOpen(false)}>
        <aside
          className="cart-drawer-panel"
          onClick={(e) => e.stopPropagation()}
          aria-label="Shopping Studio Bag"
        >
          {/* Header */}
          <div className="cart-drawer-header">
            <div className="cart-header-title-box">
              <h2 className="cart-drawer-title">Studio Bag</h2>
              <span className="cart-drawer-count">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
            </div>
            <button
              type="button"
              className="cart-close-btn"
              onClick={() => setIsCartOpen(false)}
              aria-label="Close bag"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Alert across India */}
          <div className="cart-free-shipping-bar">
            {amountNeededForFreeShipping === 0 ? (
              <span className="free-ship-tag">
                ✓ Free Handloom Delivery unlocked across all Indian pin-codes!
              </span>
            ) : (
              <span>
                Add <strong>{formatINR(amountNeededForFreeShipping)}</strong> more for <strong>Free Delivery in India</strong>
              </span>
            )}
          </div>

          {/* Items List */}
          <div className="cart-items-scroll-area">
            {cartItems.length === 0 ? (
              <div className="cart-empty-view">
                <ShoppingBag size={48} strokeWidth={1.5} color="var(--color-sand-300)" />
                <h3 className="cart-empty-title">Your Studio Bag is Empty</h3>
                <p style={{ fontSize: 'var(--text-xs)', maxWidth: '280px' }}>
                  Explore handcrafted Chikankari kurtas, Bagru block prints, and custom-tailored apparel.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsCartOpen(false)}
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const isExpanded = expandedItemId === item.cartItemId;
                const unit = item.customMeasurements?.unit || 'in';
                const totalItemPrice = (item.product.price + (item.tailoringFee || 0)) * item.quantity;

                const itemImage = getProductPreviewImage(item.product, item.selectedColor);

                return (
                  <div key={item.cartItemId} className="cart-item-card">
                    {/* Thumbnail showing authentic craft photography in selected shade */}
                    <div className="cart-item-thumb-box">
                      <img
                        src={itemImage}
                        alt={`${item.product.name} ${item.selectedColor?.name || ''}`}
                        className="cart-item-thumb-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getCraftlyFallbackSvg(item.product, item.selectedColor);
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="cart-item-content">
                      <div className="cart-item-top">
                        <div>
                          <h4 className="cart-item-name">{item.product.name}</h4>
                          <span className="cart-item-artisan">
                            {item.product.artisan?.studio} • {item.product.artisan?.location}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.cartItemId)}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Variant Specs */}
                      <div className="cart-item-specs-wrap">
                        {item.selectedColor && (
                          <span className="cart-spec-pill">
                            <span
                              className="cart-spec-dot"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                        )}

                        <span className="cart-spec-pill">
                          {item.isCustomSized ? (
                            <>
                              <Scissors size={10} color="var(--color-terracotta)" />
                              Custom Tailored (+{formatINR(item.tailoringFee)})
                            </>
                          ) : (
                            `Size: ${item.selectedSize}`
                          )}
                        </span>

                        {item.monogramInitials && (
                          <span className="cart-spec-pill">
                            Initial: "{item.monogramInitials}"
                          </span>
                        )}
                      </div>

                      {/* Expandable Custom Measurements */}
                      {item.isCustomSized && item.customMeasurements && (
                        <div>
                          <button
                            type="button"
                            className="custom-meas-edit-btn"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.cartItemId)
                            }
                          >
                            {isExpanded ? 'Hide Measurements ▲' : 'View Custom Measurements ▼'}
                          </button>

                          {isExpanded && (
                            <div className="custom-meas-details-box">
                              <div><strong>Bust:</strong> {item.customMeasurements.bust}{unit} • <strong>Waist:</strong> {item.customMeasurements.waist}{unit}</div>
                              <div><strong>Hips:</strong> {item.customMeasurements.hips}{unit} • <strong>Shoulder:</strong> {item.customMeasurements.shoulder}{unit}</div>
                              <div><strong>Sleeve:</strong> {item.customMeasurements.sleeveLength}{unit} • <strong>Length:</strong> {item.customMeasurements.dressLength}{unit}</div>
                              {item.customMeasurements.preferredFit && (
                                <div><strong>Fit:</strong> {item.customMeasurements.preferredFit}</div>
                              )}
                              {item.customMeasurements.tailoringInstructions && (
                                <div><strong>Note:</strong> {item.customMeasurements.tailoringInstructions}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity Controls */}
                      <div className="cart-item-bottom">
                        <div className="cart-item-pricing">
                          <span className="cart-item-total-price">
                            {formatINR(totalItemPrice)}
                          </span>
                          {item.tailoringFee > 0 && (
                            <span className="cart-tailoring-subnote">
                              Includes {formatINR(item.tailoringFee * item.quantity)} tailoring
                            </span>
                          )}
                        </div>

                        <div className="cart-qty-selector">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="cart-qty-num">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="cart-drawer-footer">
              {/* Coupon Row */}
              {appliedCoupon ? (
                <div className="coupon-applied-chip">
                  <span>
                    ✓ Code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.percent ? '10% off' : '₹500 off'})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c33' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-input-wrap" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Coupon (e.g. CRAFTLY10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                  <button type="submit" className="coupon-apply-btn">
                    Apply
                  </button>
                </form>
              )}

              {couponMsg && !appliedCoupon && (
                <span style={{ fontSize: '10px', color: '#c33' }}>{couponMsg.message}</span>
              )}

              {/* Subtotal */}
              <div className="cart-summary-line">
                <span>Items Subtotal:</span>
                <span>{formatINR(subtotal)}</span>
              </div>

              {/* Tailoring fees if applicable */}
              {tailoringTotal > 0 && (
                <div className="cart-summary-line" style={{ color: 'var(--color-terracotta)' }}>
                  <span>Bespoke Tailoring Fees:</span>
                  <span>+{formatINR(tailoringTotal)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="cart-summary-line">
                <span>Delivery across India:</span>
                <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
              </div>

              {/* Discount */}
              {discountAmount > 0 && (
                <div className="cart-summary-line" style={{ color: 'var(--color-sage)' }}>
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="cart-summary-grand">
                <span>Payable Amount:</span>
                <span style={{ fontSize: '1.25rem', color: 'var(--color-terracotta)' }}>
                  {formatINR(grandTotal)}
                </span>
              </div>

              {/* Checkout Action */}
              <button
                type="button"
                className="btn-checkout-cta"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Proceed to Checkout • {formatINR(grandTotal)}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
