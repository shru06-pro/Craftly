import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, HeartHandshake, Compass, Users, ArrowRight } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page-root">
      {/* Hero Banner */}
      <section className="about-hero-section">
        <div className="container">
          <div className="about-tag-pill">
            <Sparkles size={13} color="var(--color-terracotta)" />
            <span>The Craftly Manifesto</span>
          </div>
          <h1 className="about-hero-title">Reviving Generational Craftsmanship for the Modern Patron</h1>
          <p className="about-hero-subtitle">
            Craftly was founded on a simple conviction: authentic Indian handloom and artisan crafts should never be treated as mass commodities.
            We provide a direct, dignified platform where master makers earn fair living wages and patrons receive genuine, custom-tailored heirlooms.
          </p>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="about-pillars-section">
        <div className="container">
          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <ShieldCheck size={32} color="var(--color-terracotta)" className="about-pillar-icon" />
              <h3 className="about-pillar-title">100% Authentic Provenance</h3>
              <p className="about-pillar-desc">
                Every needlework stitch, mud-resist dye vat, and hand-beaten silver wire is certified genuine. No synthetic lookalikes or industrial mill fabrics.
              </p>
            </div>

            <div className="about-pillar-card">
              <HeartHandshake size={32} color="var(--color-terracotta)" className="about-pillar-icon" />
              <h3 className="about-pillar-title">Over 85% to Artisan Guilds</h3>
              <p className="about-pillar-desc">
                By eliminating predatory regional middlemen and export brokers, proceeds flow directly into artisan cooperative accounts and family ateliers.
              </p>
            </div>

            <div className="about-pillar-card">
              <Compass size={32} color="var(--color-terracotta)" className="about-pillar-icon" />
              <h3 className="about-pillar-title">Bespoke Fit & Customization</h3>
              <p className="about-pillar-desc">
                Because every piece is handcrafted individually, artisans can customize length, bust, waist, and personal monograms tailored to your silhouette.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Narrative Section */}
      <section className="about-story-section">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-content">
              <span className="section-tag">Our Provenance Story</span>
              <h2 className="section-title">From Village Looms to Conscious Closets</h2>
              <p className="about-story-para">
                In historic Hazratganj, Lucknow, master artisan Begum Naseem Akhtar practices 32 authentic Chikankari stitches learned from four generations of embroidery masters. In Bagru, outside Jaipur, Ramdev Chippa dips carved teak blocks into fermented indigo vats that have been active since 1882.
              </p>
              <p className="about-story-para">
                Yet, for decades, these generational treasures were bought for meager wages by export houses, branded with western markup, and stripped of the maker's name. Craftly returns the power, identity, and storefront directly to the artisans.
              </p>
              <div className="about-cta-row">
                <Link to="/stores" className="btn-primary">
                  <span>Meet Our Master Artisans</span>
                  <ArrowRight size={15} />
                </Link>
                <Link to="/shop" className="btn-secondary">
                  <span>Explore Marketplace</span>
                </Link>
              </div>
            </div>

            <div className="about-story-image-wrap">
              <img
                src="/images/chikankari/ivory.jpg"
                alt="Chikankari Hand Embroidery in Lucknow"
                className="about-story-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="about-img-caption">
                Master artisan in Hazratganj guild hand-finishing a featherweight muslin kurta.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

