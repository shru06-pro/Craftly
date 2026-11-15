// src/components/layout/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Heart,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import FooterModal from './FooterModal';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Redesigned Craftly Footer Component
 * 5 Dedicated Editorial Sections:
 * 1. Craftly Brand (Logo, Description, Verified Handloom Guarantee)
 * 2. Shop Collections (Apparel, Chikankari & Bagru, Leather & Mojaris, Kundan, Pottery)
 * 3. Artisan Services (Custom Sizing, Monograms, Master Artisans, Craft Process)
 * 4. Customer Support (Contact Us, Helpline, Email, FAQs, Shipping, Returns)
 * 5. About Craftly (Our Story, Artisan Network, Authenticity, Sustainability)
 *
 * Integrated with the Artisan Dispatch Newsletter and full policy modal.
 */
export default function Footer() {
  // Support Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('faq');

  // Newsletter Subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleOpenModal = (tabName) => {
    setActiveModalTab(tabName);
    setModalOpen(true);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  const handleScrollTo = (targetId) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* =========================================================
            TOP: The Craftly Dispatch Newsletter Strip
            ========================================================= */}
        <div className="footer-dispatch-strip">
          <div className="footer-dispatch-content">
            <div className="footer-dispatch-badge">
              <Sparkles size={14} color="var(--color-terracotta)" />
              <span>The Craftly Atelier Dispatch</span>
            </div>
            <h3 className="footer-dispatch-title">
              Stories from the Looms & Private Invitations
            </h3>
            <p className="footer-dispatch-desc">
              Field notes from weaving studios, natural dye recipe journals, and private access to limited artisan batch drops.
            </p>
          </div>

          <div className="footer-dispatch-form-wrap">
            {newsletterSubscribed ? (
              <div className="footer-dispatch-success">
                <CheckCircle2 size={18} color="var(--color-sage)" />
                <span>Welcome to the Dispatch! First journal sent to <strong>{newsletterEmail}</strong>.</span>
              </div>
            ) : (
              <form className="footer-dispatch-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="footer-dispatch-input"
                  aria-label="Email address for Craftly newsletter"
                />
                <button type="submit" className="footer-dispatch-btn">
                  <span>Join Dispatch</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* =========================================================
            MAIN: 5-Column Marketplace Footer Grid
            ========================================================= */}
        <div className="footer-main-grid">
          {/* SECTION 1 — Craftly Brand */}
          <div className="footer-column footer-brand-column">
            <Link to="/" className="footer-brand-header" aria-label="Craftly Home">
              <span className="footer-brand-title">
                Craftly
                <span className="footer-brand-dot" aria-hidden="true"></span>
              </span>
              <span className="footer-brand-tagline">Indian Handlooms & Bespoke Craft</span>
            </Link>

            <p className="footer-brand-desc">
              India's curated marketplace connecting discerning patrons directly with certified master weavers,
              Chikankari embroiderers, and generational craft guilds across Lucknow, Bagru, Maheshwar, and Santiniketan.
            </p>

            <div className="footer-ethos-badge">
              <ShieldCheck size={16} color="var(--color-sage)" />
              <span>100% Verified Indian Handloom Guarantee</span>
            </div>
          </div>

          {/* SECTION 2 — Shop Collections */}
          <div className="footer-column">
            <h4 className="footer-column-title">Shop Collections</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/#collections" onClick={() => handleScrollTo('collections')}>
                  Handcrafted Apparel
                </Link>
              </li>
              <li>
                <Link to="/?search=Chikankari#collections" onClick={() => handleScrollTo('collections')}>
                  Chikankari & Bagru
                </Link>
              </li>
              <li>
                <Link to="/?search=Leather#collections" onClick={() => handleScrollTo('collections')}>
                  Leather & Mojaris
                </Link>
              </li>
              <li>
                <Link to="/?search=Jewelry#collections" onClick={() => handleScrollTo('collections')}>
                  Kundan Jewellery
                </Link>
              </li>
              <li>
                <Link to="/?search=Pottery#collections" onClick={() => handleScrollTo('collections')}>
                  Studio Pottery
                </Link>
              </li>
            </ul>
          </div>

          {/* SECTION 3 — Artisan Services */}
          <div className="footer-column">
            <h4 className="footer-column-title">Artisan Services</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/#customizer" onClick={() => handleScrollTo('customizer')}>
                  Custom Sizing
                </Link>
              </li>
              <li>
                <Link to="/#customizer" onClick={() => handleScrollTo('customizer')}>
                  Personalized Monogram
                </Link>
              </li>
              <li>
                <Link to="/#artisan-spotlight" onClick={() => handleScrollTo('artisan-spotlight')}>
                  Meet Master Artisans
                </Link>
              </li>
              <li>
                <Link to="/#manifesto" onClick={() => handleScrollTo('manifesto')}>
                  Our Craft Process
                </Link>
              </li>
            </ul>
          </div>

          {/* SECTION 4 — Customer Support */}
          <div className="footer-column footer-support-column">
            <h4 className="footer-column-title">Customer Support</h4>
            <ul className="footer-links-list">
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => handleOpenModal('contact')}
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a
                  href="tel:+911800000000"
                  className="footer-contact-link"
                  title="Call Craftly Helpline"
                >
                  <Phone size={13} className="footer-contact-icon" />
                  <span>+91 1800-XXX-XXXX [Helpline]</span>
                </a>
                <span className="footer-contact-hours">Mon–Sat, 10 AM – 7 PM IST</span>
              </li>
              <li>
                <a
                  href="mailto:support@craftly.in"
                  className="footer-contact-link"
                  title="Email Craftly Support Desk"
                >
                  <Mail size={13} className="footer-contact-icon" />
                  <span>support@craftly.in [Placeholder]</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => handleOpenModal('faq')}
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => handleOpenModal('shipping')}
                >
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => handleOpenModal('returns')}
                >
                  Returns & Refunds
                </button>
              </li>
            </ul>
          </div>

          {/* SECTION 5 — About Craftly */}
          <div className="footer-column">
            <h4 className="footer-column-title">About Craftly</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/#manifesto" onClick={() => handleScrollTo('manifesto')}>
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/#artisan-spotlight" onClick={() => handleScrollTo('artisan-spotlight')}>
                  Our Artisan Network
                </Link>
              </li>
              <li>
                <Link to="/#manifesto" onClick={() => handleScrollTo('manifesto')}>
                  Authenticity Promise
                </Link>
              </li>
              <li>
                <Link to="/#manifesto" onClick={() => handleScrollTo('manifesto')}>
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* =========================================================
            BOTTOM: Trust Badges, Copyright & Artisan Attribution
            ========================================================= */}
        <div className="footer-bottom-trust-row">
          <div className="footer-trust-pill">
            <ShieldCheck size={14} color="var(--color-sage)" />
            <span>GI-Tagged Certified Handlooms</span>
          </div>
          <div className="footer-trust-pill">
            <Sparkles size={14} color="var(--color-terracotta)" />
            <span>85%+ Direct Artisan Living Wages</span>
          </div>
          <div className="footer-trust-pill">
            <ShieldCheck size={14} color="var(--color-sage)" />
            <span>Plastic-Free Recycled Packaging</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {CURRENT_YEAR} Craftly India. Celebrating Indian Artisanal Excellence. All Rights Reserved.
          </p>
          <p className="footer-love-note">
            Handcrafted with <Heart size={14} color="var(--color-terracotta)" fill="var(--color-terracotta)" /> for independent Indian makers.
          </p>
        </div>
      </div>

      {/* Global Information & Support Modal */}
      <FooterModal
        isOpen={modalOpen}
        activeTab={activeModalTab}
        onClose={() => setModalOpen(false)}
        onSelectTab={(tab) => setActiveModalTab(tab)}
      />
    </footer>
  );
}
