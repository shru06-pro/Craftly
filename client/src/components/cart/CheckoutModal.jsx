// src/components/cart/CheckoutModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatCurrency';
import './CheckoutModal.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi NCR', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, grandTotal, subtotal, tailoringTotal, shippingFee, discountAmount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    addressLine: '',
    locality: '',
    city: '',
    state: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = 'CRF-IN-' + Math.floor(100000 + Math.random() * 900000);
      setOrderConfirmed({
        orderId,
        itemsCount: cartItems.length,
        total: grandTotal,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      });
      clearCart();
      setIsSubmitting(false);
    }, 900);
  };

  return (
    <div className="checkout-backdrop" role="dialog" aria-modal="true">
      <div className="checkout-modal-card">
        {/* Header */}
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">
            {orderConfirmed ? 'Atelier Order Confirmed' : 'Bespoke Atelier Checkout'}
          </h2>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {orderConfirmed ? (
          /* Confirmation Screen */
          <div className="checkout-success-view">
            <div className="success-stamp-icon">
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: 0 }}>
              Dhanyavaad! Your Bespoke Order is Placed
            </h3>
            <span className="order-id-badge">Order ID: {orderConfirmed.orderId}</span>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', maxWidth: '440px', margin: 0 }}>
              Your order of {formatINR(orderConfirmed.total)} has been dispatched to our independent craft studios.
              You will receive custom tailoring milestone updates on WhatsApp & SMS (+91 {formData.phone}).
            </p>

            <div style={{
              backgroundColor: 'var(--color-sand-50)',
              border: '1px solid var(--color-sand-200)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              textAlign: 'left',
              width: '100%',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>Delivery Destination:</strong> {formData.fullName}, {formData.addressLine}, {formData.locality}, {formData.city}, {formData.state} - {formData.pincode}</div>
              <div><strong>Estimated Dispatch:</strong> 4-6 business days directly from artisan ateliers</div>
              <div><strong>Payment Mode:</strong> {paymentMethod.toUpperCase()} (Confirmed)</div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={onClose}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Continue Exploring Collections
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder}>
            <div className="checkout-modal-body">
              {/* Shipping Address */}
              <div>
                <div className="checkout-section-title">
                  <MapPin size={14} color="var(--color-terracotta)" />
                  Delivery Destination (India)
                </div>

                <div className="checkout-form-grid">
                  <div className="checkout-input-field">
                    <label className="checkout-label">Full Name *</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-input-field">
                    <label className="checkout-label">10-Digit Mobile (+91) *</label>
                    <input
                      required
                      type="tel"
                      pattern="[0-9]{10}"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-input-field full-width">
                    <label className="checkout-label">Flat / House No. / Building *</label>
                    <input
                      required
                      type="text"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleInputChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-input-field">
                    <label className="checkout-label">Street / Colony / Locality *</label>
                    <input
                      required
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleInputChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-input-field">
                    <label className="checkout-label">6-Digit PIN Code *</label>
                    <input
                      required
                      type="text"
                      pattern="[0-9]{6}"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-input-field">
                    <label className="checkout-label">City *</label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-input-field">
                    <label className="checkout-label">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="checkout-select"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="checkout-section-title">
                  <CreditCard size={14} color="var(--color-terracotta)" />
                  Payment Mode
                </div>

                <div className="payment-methods-grid">
                  <div
                    className={`payment-method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                    />
                    <span className="payment-method-text">UPI (GPay / PhonePe / Paytm)</span>
                  </div>

                  <div
                    className={`payment-method-card ${paymentMethod === 'cards' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cards')}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'cards'}
                      onChange={() => setPaymentMethod('cards')}
                    />
                    <span className="payment-method-text">Debit / Credit Card</span>
                  </div>

                  <div
                    className={`payment-method-card ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                    />
                    <span className="payment-method-text">Net Banking (HDFC, ICICI, SBI)</span>
                  </div>

                  <div
                    className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span className="payment-method-text">Cash on Delivery (COD)</span>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div style={{ marginTop: '8px' }}>
                    <label className="checkout-label">Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="checkout-input"
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                )}
              </div>

              {/* Order summary breakdown */}
              <div className="checkout-order-summary-box">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Items Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {tailoringTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-terracotta)' }}>
                    <span>Custom Tailoring Charges:</span>
                    <span>+{formatINR(tailoringTotal)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Standard Handloom Delivery:</span>
                  <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-sage)' }}>
                    <span>Coupon Discount:</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', paddingTop: '6px', borderTop: '1px solid var(--color-sand-200)' }}>
                  <span>Final Payable Amount:</span>
                  <span style={{ color: 'var(--color-espresso)' }}>{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="checkout-modal-footer">
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                100% Safe Artisan Escrow
              </span>
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="btn-primary"
              >
                {isSubmitting ? 'Confirming with Ateliers...' : `Place Order • ${formatINR(grandTotal)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
