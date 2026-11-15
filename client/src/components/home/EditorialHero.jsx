// src/components/home/EditorialHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Scissors, ShieldCheck, Heart, Compass } from 'lucide-react';
import './EditorialHero.css';

export default function EditorialHero() {
  return (
    <section className="editorial-hero-section">
      <div className="container">
        <div className="hero-editorial-grid">
          {/* Left Column: Editorial Storytelling & Direct Shopping CTAs */}
          <div className="hero-content-column">
            <div className="hero-kicker-badge">
              <Sparkles size={13} color="var(--color-terracotta, #B85834)" />
              <span>India's Women's Fashion & Lifestyle Marketplace</span>
            </div>

            <h1 className="hero-editorial-title">
              Homegrown Indian fashion, modern silhouettes &amp; <em>master artisan craft</em>.
            </h1>

            <p className="hero-editorial-lead">
              Connecting college students and young working women directly with verified Indian independent boutiques, local designers, and certified generational craft ateliers. Made to measure. Zero mass factory middlemen.
            </p>

            <div className="hero-action-buttons">
              <Link to="/shop" className="btn-primary hero-btn-shop">
                <span>Shop New Arrivals</span>
                <ArrowRight size={16} />
              </Link>
              <a href="#outfit-inspiration" className="btn-secondary hero-btn-looks">
                <span>Outfit Inspiration</span>
              </a>
              <Link to="/stores" className="hero-btn-link">
                <span>Browse Indian Ateliers</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Editorial Trust Badges */}
            <div className="hero-trust-bar">
              <div className="trust-pill">
                <span className="trust-dot"></span>
                <span>Homegrown Indian Labels</span>
              </div>
              <div className="trust-pill">
                <Scissors size={13} color="var(--color-terracotta, #B85834)" />
                <span>Made to Measure Sizing</span>
              </div>
              <div className="trust-pill">
                <ShieldCheck size={13} color="var(--color-terracotta, #B85834)" />
                <span>Verified Independent Ateliers</span>
              </div>
              <div className="trust-pill">
                <strong>₹ INR</strong>
                <span>All Prices in Rupees</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Fashion Editorial Photography */}
          <div className="hero-visual-column">
            <div className="hero-image-composition">
              <div className="hero-main-photo-wrap">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85"
                  alt="Contemporary Indian Women's Fashion Editorial"
                  className="hero-main-photo"
                  loading="eager"
                />
                <div className="hero-floating-card top-right">
                  <div className="floating-card-tag">New In</div>
                  <div className="floating-card-title">Clean Girl College Edit</div>
                  <div className="floating-card-price">Starting ₹799</div>
                </div>
              </div>

              <div className="hero-secondary-photo-wrap">
                <img
                  src="/images/chikankari/ivory.jpg"
                  alt="Awadhi Chikankari Handspun Muslin"
                  className="hero-secondary-photo"
                  loading="lazy"
                />
                <div className="hero-artisan-floating-tag">
                  <span className="artisan-badge-dot"></span>
                  <span>Handcrafted in Lucknow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

