import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Store,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Scissors
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatCurrency';
import AuthModal from '../components/common/AuthModal';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, tailoringTotal, shippingFee, discountAmount, grandTotal, appliedCoupon, clearCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Shipping Address Form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    pincode: '',
    addressLine: '',
    locality: '',
    city: '',
    state: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, COD, CARD, NETBANKING
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill address if customer has default saved address
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setShippingAddress({
        fullName: def.fullName || user.name || '',
        phone: def.phone || user.phone || '',
        pincode: def.pincode || '',
        addressLine: def.line1 || '',
        locality: def.locality || '',
        city: def.city || '',
        state: def.state || '',
      });
    } else if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Group items by store for summary
  const storeGroups = cartItems.reduce((acc, item) => {
    const store = item.product.artisan?.studio || item.product.artisan?.studioName || 'Atelier Guild';
    if (!acc[store]) acc[store] = [];
    acc[store].push(item);
    return acc;
  }, {});

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.pincode || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          colorName: item.selectedColor?.name || 'Standard',
          colorHex: item.selectedColor?.hex,
          size: item.selectedSize || 'Standard',
          isCustomSized: Boolean(item.isCustomSized),
          customMeasurements: item.customMeasurements,
          monogramInitials: item.monogramInitials,
        })),
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        userId: user.id,
      };

      const res = await fetch('http://localhost:4000/v1/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Checkout failed');
      }

      const createdOrder = json.data;
      clearCart();
      navigate(`/account/orders/${createdOrder.orderId}`, {
        state: { newOrderPlaced: true, orderNumber: createdOrder.orderId },
      });
    } catch (err) {
      setErrorMessage(err.message || 'Error creating order session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container checkout-empty">
        <h2>Your bag is empty</h2>
        <p>Please add handcrafted items to your bag before checking out.</p>
        <Link to="/shop" className="btn-primary">Browse Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-root">
      <div className="container">
        <div className="checkout-header">
          <div className="checkout-security-tag">
            <Lock size={13} color="var(--color-terracotta)" />
            <span>Secure Atelier Checkout</span>
          </div>
          <h1 className="checkout-title">Review & Place Your Bespoke Order</h1>
        </div>

        {/* Authentication Notice if not logged in */}
        {!isAuthenticated && (
          <div className="checkout-auth-alert">
            <AlertCircle size={20} color="var(--color-terracotta)" />
            <div className="auth-alert-text">
              <strong>Patron Sign In Required:</strong> You must be signed in to link your custom measurements and track artisan fulfilment.
            </div>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => setAuthModalOpen(true)}
            >
              Sign In or Register
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* Left Column: Shipping Address & Payment Selection */}
          <div className="checkout-form-col">
            {/* 1. Shipping Address */}
            <div className="checkout-card">
              <div className="card-header-row">
                <Truck size={20} color="var(--color-terracotta)" />
                <h2 className="card-title">1. Destination Shipping Address</h2>
              </div>

              <div className="form-fields-grid">
                <div className="form-group full-width">
                  <label htmlFor="ship-name">Recipient Full Name *</label>
                  <input
                    id="ship-name"
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ship-phone">Contact Mobile Number *</label>
                  <input
                    id="ship-phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ship-pincode">Postal Pincode *</label>
                  <input
                    id="ship-pincode"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="110016"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="ship-line">Street Address / House No. / Atelier *</label>
                  <input
                    id="ship-line"
                    type="text"
                    required
                    placeholder="B-42, Gulmohar Enclave, Hauz Khas"
                    value={shippingAddress.addressLine}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ship-city">City / District *</label>
                  <input
                    id="ship-city"
                    type="text"
                    required
                    placeholder="New Delhi"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ship-state">State *</label>
                  <input
                    id="ship-state"
                    type="text"
                    required
                    placeholder="Delhi"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="checkout-card">
              <div className="card-header-row">
                <CreditCard size={20} color="var(--color-terracotta)" />
                <h2 className="card-title">2. Payment Method</h2>
              </div>

              <div className="payment-options-list">
                <label className={`payment-option-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div className="payment-option-info">
                    <strong>UPI & Instant QR Payment</strong>
                    <span>Google Pay, PhonePe, Paytm, BHIM (Zero transaction fees)</span>
                  </div>
                </label>

                <label className={`payment-option-card ${paymentMethod === 'CARD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <div className="payment-option-info">
                    <strong>Credit / Debit Card</strong>
                    <span>Visa, MasterCard, RuPay, Diners Club</span>
                  </div>
                </label>

                <label className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className="payment-option-info">
                    <strong>Cash on Delivery (COD)</strong>
                    <span>Pay in cash or UPI upon delivery by regional courier</span>
                  </div>
                </label>
              </div>

              <div className="payment-disclaimer-box">
                <ShieldCheck size={16} color="var(--color-terracotta)" />
                <span>Payment gateway integration is sandbox-ready. All transactions are securely audited.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Store Order Breakdown */}
          <div className="checkout-summary-col">
            <div className="checkout-summary-card">
              <h3 className="summary-card-title">Order Breakdown ({cartItems.length} items)</h3>

              <div className="checkout-stores-list">
                {Object.entries(storeGroups).map(([storeName, items]) => (
                  <div key={storeName} className="checkout-store-block">
                    <div className="checkout-store-name">
                      <Store size={14} color="var(--color-terracotta)" />
                      <span>{storeName}</span>
                    </div>

                    <div className="checkout-items-mini">
                      {items.map((item) => (
                        <div key={item.cartItemId} className="checkout-item-mini">
                          <div className="mini-item-info">
                            <span className="mini-item-name">{item.product.name}</span>
                            <span className="mini-item-specs">
                              {item.selectedColor?.name} • Size {item.selectedSize} • Qty {item.quantity}
                              {item.isMadeToOrder && (
                                <span className="mini-custom-tag" style={{ background: '#FFF0EA', color: '#B85834', borderColor: '#E8D4C4' }}>
                                  Made to Order
                                </span>
                              )}
                              {item.isCustomSized && (
                                <span className="mini-custom-tag">
                                  <Scissors size={10} style={{ marginRight: '2px' }} /> Custom Sized
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="mini-item-price">
                            {formatINR((item.product.price + (item.tailoringFee || 0)) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="checkout-totals-lines">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {tailoringTotal > 0 && (
                  <div className="summary-line">
                    <span>Tailoring Total</span>
                    <span>+{formatINR(tailoringTotal)}</span>
                  </div>
                )}
                <div className="summary-line">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-line discount">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="summary-total-divider" />
                <div className="summary-line grand-total">
                  <span>Total Amount</span>
                  <span className="total-amount">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="checkout-error-banner">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary checkout-confirm-btn"
              >
                {isSubmitting ? (
                  <span>Processing Artisan Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order ({formatINR(grandTotal)})</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="checkout-terms-note">
                By placing this order, you support independent master artisans across India with fair living wages.
              </p>
            </div>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}

