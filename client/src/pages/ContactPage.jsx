import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'customization',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="contact-page-root">
      <section className="contact-hero-section">
        <div className="container">
          <div className="contact-tag-pill">
            <MessageSquare size={13} color="var(--color-terracotta)" />
            <span>Connect with Craftly</span>
          </div>
          <h1 className="contact-hero-title">We Are Here to Assist Your Craft Journey</h1>
          <p className="contact-hero-subtitle">
            Have questions about custom sizing, an order milestone, or interested in registering your artisan atelier?
            Our support guild and craft advisors will respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="contact-body-section">
        <div className="container">
          <div className="contact-layout-grid">
            {/* Left Column: Direct Info */}
            <div className="contact-info-col">
              <h2 className="contact-col-title">Atelier Guild Contacts</h2>
              <p className="contact-col-sub">
                Reach our team directly for custom bespoke inquiries, order tracking, or artisan onboarding.
              </p>

              <div className="contact-cards-list">
                <div className="contact-card">
                  <div className="contact-card-icon-wrap">
                    <Mail size={18} color="var(--color-terracotta)" />
                  </div>
                  <div>
                    <h3 className="contact-card-title">Electronic Dispatch</h3>
                    <p className="contact-card-value">patron@craftly.in</p>
                    <span className="contact-card-note">Inquiries answered Monday through Saturday</span>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon-wrap">
                    <Phone size={18} color="var(--color-terracotta)" />
                  </div>
                  <div>
                    <h3 className="contact-card-title">Concierge & WhatsApp</h3>
                    <p className="contact-card-value">+91 99999 00000</p>
                    <span className="contact-card-note">10:00 AM – 7:00 PM IST (Mon–Sat)</span>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon-wrap">
                    <MapPin size={18} color="var(--color-terracotta)" />
                  </div>
                  <div>
                    <h3 className="contact-card-title">Guild Verification Atelier</h3>
                    <p className="contact-card-value">Hazratganj Craft Guild, Lucknow, UP 226001</p>
                    <span className="contact-card-note">Direct artisan inspection and bespoke fittings by appointment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                {submitted ? (
                  <div className="contact-submitted-state">
                    <CheckCircle2 size={48} color="var(--color-terracotta)" />
                    <h2>Inquiry Dispatched to the Guild</h2>
                    <p>
                      Thank you, <strong>{formData.name}</strong>. Your message regarding <em>{formData.topic}</em> has been received.
                      A master craft advisor will follow up with you at <strong>{formData.email}</strong> within 1 business day.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', topic: 'customization', message: '' });
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <h3 className="form-heading">Send an Inquiry</h3>
                    <p className="form-subheading">Fill in your details and we will connect you directly.</p>

                    <div className="form-group">
                      <label htmlFor="contact-name">Full Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Aarav Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-email">Email Address *</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="aarav@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-phone">Phone Number (Optional)</label>
                        <input
                          id="contact-phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-topic">Inquiry Topic</label>
                      <select
                        id="contact-topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="form-select"
                      >
                        <option value="customization">Bespoke Dress Sizing & Customization</option>
                        <option value="order">Order Tracking & Fulfilment</option>
                        <option value="store-onboarding">Artisan Store / Atelier Registration</option>
                        <option value="bulk-gifting">Wedding & Corporate Heirloom Gifting</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-message">Your Message *</label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        placeholder="Describe your inquiry, sizing request, or atelier details..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="form-textarea"
                      />
                    </div>

                    <button type="submit" className="btn-primary contact-submit-btn">
                      <span>Dispatch Inquiry to Guild</span>
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

