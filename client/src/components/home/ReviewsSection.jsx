// src/components/home/ReviewsSection.jsx
import React from 'react';
import { Star } from 'lucide-react';
import { REVIEWS } from '../../data/mockProducts';
import './ReviewsSection.css';

export default function ReviewsSection() {
  return (
    <section className="reviews-section">
      <div className="container">
        <div className="reviews-header">
          <span className="section-tag">Provenance & Testimonials</span>
          <h2 className="section-title">Stories from Bespoke Collectors</h2>
          <p className="section-subtitle">
            Every piece is shipped directly from the artisan's workbench to your door with its own craft certification.
          </p>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="review-card">
              <div>
                <div className="review-stars">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="review-text">"{rev.text}"</p>
              </div>

              <div className="review-author-line">
                <div>
                  <div className="review-author-name">{rev.author}</div>
                  <div className="review-item-tag">{rev.itemPurchased}</div>
                </div>
                <span className="review-author-location">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
