// src/components/layout/FooterModal.jsx
import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  RotateCcw,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import './FooterModal.css';

/**
 * Footer Information & Customer Support Modal
 * Provides complete, genuine policy details for:
 * - FAQs
 * - Shipping & Delivery
 * - Returns & Alterations
 * - Contact Us & Helpline
 */
export default function FooterModal({ isOpen, activeTab = 'faq', onClose, onSelectTab }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="footer-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="footer-modal-title"
    >
      <div
        className="footer-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="footer-modal-header">
          <div className="footer-modal-title-group">
            <span className="footer-modal-kicker">Craftly Patron Care</span>
            <h3 id="footer-modal-title" className="footer-modal-heading">
              {activeTab === 'faq' && 'Frequently Asked Questions'}
              {activeTab === 'shipping' && 'Shipping & Handloom Delivery'}
              {activeTab === 'returns' && 'Returns & Bespoke Alterations'}
              {activeTab === 'contact' && 'Contact Us & Artisan Support'}
            </h3>
          </div>
          <button
            type="button"
            className="footer-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tab Buttons */}
        <div className="footer-modal-tabs">
          <button
            type="button"
            className={`footer-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => onSelectTab('faq')}
          >
            <HelpCircle size={15} />
            <span>FAQs</span>
          </button>

          <button
            type="button"
            className={`footer-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => onSelectTab('shipping')}
          >
            <Truck size={15} />
            <span>Shipping</span>
          </button>

          <button
            type="button"
            className={`footer-tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => onSelectTab('returns')}
          >
            <RotateCcw size={15} />
            <span>Returns & Alterations</span>
          </button>

          <button
            type="button"
            className={`footer-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => onSelectTab('contact')}
          >
            <Phone size={15} />
            <span>Contact Details</span>
          </button>
        </div>

        {/* Modal Body Panels */}
        <div className="footer-modal-body">
          {/* TAB 1: FAQs */}
          {activeTab === 'faq' && (
            <div className="footer-policy-panel">
              <div className="policy-qa-item">
                <h4 className="policy-question">How does bespoke custom sizing work on Craftly?</h4>
                <p className="policy-answer">
                  When choosing any made-to-measure piece (such as our Lucknow Chikankari kurtas or Bagru dresses),
                  you can select <strong>Request Bespoke Custom Tailoring (+₹350)</strong> on the product page.
                  Provide your bust, waist, hips, sleeve length, and kurta length in inches or centimetres.
                  Master craftsmen like Begum Naseem Akhtar tailor each garment to your individual silhouette.
                </p>
              </div>

              <div className="policy-qa-item">
                <h4 className="policy-question">Where are Craftly products created?</h4>
                <p className="policy-answer">
                  Every piece originates directly from verified Indian heritage craft clusters: Lucknow (Chikankari),
                  Bagru & Jaipur (Dabu mud-resist & vegetable dyes), Maheshwar (silk-cotton handlooms), Santiniketan
                  (vegetable-tanned embossed leather), and Khurja (studio ceramics).
                </p>
              </div>

              <div className="policy-qa-item">
                <h4 className="policy-question">Are the dyes natural and safe for sensitive skin?</h4>
                <p className="policy-answer">
                  Yes. We use natural river-clay resists, fermented indigo vats, harda (myrobalan), pomegranate rinds,
                  and iron rust for our block prints. They are chemical-free, gentle on the skin, and age gracefully
                  with proper gentle handwashing.
                </p>
              </div>

              <div className="policy-qa-item">
                <h4 className="policy-question">How does Craftly ensure fair wages for weavers and artisans?</h4>
                <p className="policy-answer">
                  By bypassing middlemen mandis, over 85% of net proceeds go directly to certified artisan guilds.
                  Artisans set their own pricing reflecting the true hours of meticulous hand-embroidery and loom work.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Shipping & Delivery */}
          {activeTab === 'shipping' && (
            <div className="footer-policy-panel">
              <div className="policy-feature-grid">
                <div className="policy-feature-card">
                  <Truck size={20} className="policy-card-icon" />
                  <strong>Free Insured Handloom Delivery</strong>
                  <p>All orders across India qualify for complimentary insured courier dispatch with real-time tracking.</p>
                </div>
                <div className="policy-feature-card">
                  <Clock size={20} className="policy-card-icon" />
                  <strong>Artisan Lead Times</strong>
                  <p>Standard pieces ship in 2–4 business days. Custom-tailored & monogrammed garments ship in 5–8 days.</p>
                </div>
                <div className="policy-feature-card">
                  <ShieldCheck size={20} className="policy-card-icon" />
                  <strong>19,000+ Indian Pincodes</strong>
                  <p>Delivered via BlueDart, Delhivery, and India Post Speed Post with tamper-proof seal packaging.</p>
                </div>
                <div className="policy-feature-card">
                  <Sparkles size={20} className="policy-card-icon" />
                  <strong>Zero-Plastic Packaging</strong>
                  <p>Wrapped in handmade recycled paper and unbleached cotton keepsake pouches crafted by women's cooperatives.</p>
                </div>
              </div>

              <div className="policy-note-box">
                <strong>Dispatch Notifications:</strong> You will receive email, SMS, and WhatsApp alerts with a tracking link as soon as the weaver atelier dispatches your consignment.
              </div>
            </div>
          )}

          {/* TAB 3: Returns & Alterations */}
          {activeTab === 'returns' && (
            <div className="footer-policy-panel">
              <div className="policy-feature-grid">
                <div className="policy-feature-card">
                  <RotateCcw size={20} className="policy-card-icon" />
                  <strong>7-Day Artisan Exchange</strong>
                  <p>Standard size garments can be exchanged within 7 days of delivery if unworn with tags intact.</p>
                </div>
                <div className="policy-feature-card">
                  <Sparkles size={20} className="policy-card-icon" />
                  <strong>Free Tailoring Alterations</strong>
                  <p>If your custom-sized garment needs slight tightening or loosening, our atelier tailors adjust it free of charge.</p>
                </div>
              </div>

              <div className="policy-qa-item" style={{ marginTop: '1rem' }}>
                <h4 className="policy-question">How do I initiate a return or adjustment?</h4>
                <p className="policy-answer">
                  Simply email our patron care desk at{' '}
                  <a href="mailto:support@craftly.in" className="policy-inline-link">
                    support@craftly.in
                  </a>{' '}
                  or call our helpline with your Order ID (starts with <code>CRF-IN-</code>). We will arrange a doorstep pickup.
                </p>
              </div>

              <div className="policy-note-box">
                <strong>Note on Handmade Variations:</strong> Subtle variations in hand-block alignment, weave slubs, and natural dye tones are hallmarks of genuine handcrafting and are not considered defects.
              </div>
            </div>
          )}

          {/* TAB 4: Contact Us & Helpline */}
          {activeTab === 'contact' && (
            <div className="footer-policy-panel">
              <p className="policy-panel-intro">
                Have questions about custom sizing, artisan provenance, or your order? Connect directly with our Indian artisan concierge desk:
              </p>

              <div className="contact-details-grid">
                <div className="contact-detail-card">
                  <Phone size={22} className="contact-icon" />
                  <div>
                    <span className="contact-label">Customer Support Helpline</span>
                    <a href="tel:+911800000000" className="contact-value-link">
                      +91 1800-XXX-XXXX [Placeholder Helpline]
                    </a>
                    <span className="contact-subtext">Toll-free across India • Mon–Sat, 10:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                <div className="contact-detail-card">
                  <Mail size={22} className="contact-icon" />
                  <div>
                    <span className="contact-label">Email Support Desk</span>
                    <a href="mailto:support@craftly.in" className="contact-value-link">
                      support@craftly.in [Placeholder]
                    </a>
                    <span className="contact-subtext">Average response time: within 4 business hours</span>
                  </div>
                </div>

                <div className="contact-detail-card">
                  <MapPin size={22} className="contact-icon" />
                  <div>
                    <span className="contact-label">Atelier Guild Office</span>
                    <span className="contact-plain-text">
                      Craftly Artisan Guild, Hazratganj Weavers Lane, Lucknow, Uttar Pradesh 226001 [Placeholder Address]
                    </span>
                    <span className="contact-subtext">Direct coordination with UP, Rajasthan & MP Master Weaver Guilds</span>
                  </div>
                </div>

                <div className="contact-detail-card">
                  <Clock size={22} className="contact-icon" />
                  <div>
                    <span className="contact-label">Studio Operating Hours</span>
                    <span className="contact-plain-text">Monday to Saturday: 10:00 AM – 7:00 PM IST</span>
                    <span className="contact-subtext">Closed on National Handloom Day & Public Holidays</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="footer-modal-bottom-bar">
          <div className="footer-modal-badge">
            <ShieldCheck size={14} color="var(--color-sage)" />
            <span>Direct Weavers living wage guarantee</span>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
