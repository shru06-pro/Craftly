// src/components/home/ArtisanSpotlight.jsx
import React from 'react';
import { ArrowRight, Award } from 'lucide-react';
import { FEATURED_ARTISAN } from '../../data/mockProducts';
import './ArtisanSpotlight.css';

export default function ArtisanSpotlight() {
  const artisan = FEATURED_ARTISAN;

  return (
    <section className="artisan-spotlight-section" id="artisan-spotlight">
      <div className="container">
        <div className="spotlight-card">
          {/* Visual Atelier Side */}
          <div className="spotlight-visual-side">
            <img
              src={artisan.studioPhoto}
              alt={`${artisan.studio} Workshop`}
              className="spotlight-studio-img"
            />

            {/* Atelier Seal Overlay */}
            <div className="spotlight-seal-badge">
              <img
                src={artisan.avatar}
                alt={artisan.name}
                className="spotlight-avatar"
              />
              <div className="spotlight-seal-info">
                <span className="spotlight-seal-name">{artisan.name}</span>
                <span className="spotlight-seal-location">
                  {artisan.studio} • {artisan.location}
                </span>
              </div>
            </div>
          </div>

          {/* Editorial Interview Content */}
          <div className="spotlight-content-side">
            <div>
              <span className="spotlight-kicker">
                <Award size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Atelier of the Month
              </span>
              <h2 className="spotlight-title">
                The Living Heritage of Lucknow Chikankari with {artisan.name}
              </h2>
              <blockquote className="spotlight-quote">
                "{artisan.quote}"
              </blockquote>
            </div>

            <div>
              <div className="spotlight-stats-row">
                {artisan.stats.map((stat, idx) => (
                  <div key={idx} className="stat-item">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="spotlight-actions">
                <a href="#collections" className="btn-primary">
                  View {artisan.name}'s Studio Works
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
