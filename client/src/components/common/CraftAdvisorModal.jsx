// src/components/common/CraftAdvisorModal.jsx
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { formatINR } from '../../utils/formatCurrency';
import './CraftAdvisorModal.css';

const OCCASIONS = [
  { id: 'all', label: 'All Occasions' },
  { id: 'festive', label: 'Festive & Weddings' },
  { id: 'everyday', label: 'Daily Handloom & Office' },
  { id: 'gifting', label: 'Bespoke Heirlooms & Gifting' },
];

const BUDGETS = [
  { id: 'all', label: 'Any Budget' },
  { id: 'under1500', label: 'Under ₹1,500' },
  { id: '1500to3000', label: '₹1,500 – ₹3,000' },
  { id: 'above3000', label: 'Above ₹3,000' },
];

export default function CraftAdvisorModal({ isOpen, onClose, onSelectProduct }) {
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');

  if (!isOpen) return null;

  // Filter recommendations from actual catalog
  const recommendations = MOCK_PRODUCTS.filter((product) => {
    // Budget filter
    if (selectedBudget === 'under1500' && product.price >= 1500) return false;
    if (selectedBudget === '1500to3000' && (product.price < 1500 || product.price > 3000)) return false;
    if (selectedBudget === 'above3000' && product.price <= 3000) return false;

    // Occasion heuristics
    if (selectedOccasion === 'festive') {
      return product.category === 'jewelry' || product.price > 2000 || product.badge === 'GI Tagged';
    }
    if (selectedOccasion === 'everyday') {
      return product.category === 'apparel' || product.category === 'accessories' || product.price < 2500;
    }
    if (selectedOccasion === 'gifting') {
      return product.customizable || product.category === 'home' || product.category === 'leather';
    }

    return true;
  });

  return (
    <div className="advisor-backdrop" role="dialog" aria-modal="true">
      <div className="advisor-card">
        {/* Header */}
        <div className="advisor-header">
          <h2 className="advisor-title">
            <Sparkles size={18} color="var(--color-terracotta)" />
            Indian Craft & Fit Advisor
          </h2>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close advisor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="advisor-body">
          {/* Question 1: Occasion */}
          <div className="advisor-question-block">
            <span className="advisor-q-label">1. What occasion are you curating for?</span>
            <div className="advisor-pills-row">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  className={`advisor-pill-btn ${selectedOccasion === occ.id ? 'active' : ''}`}
                  onClick={() => setSelectedOccasion(occ.id)}
                >
                  {occ.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Budget */}
          <div className="advisor-question-block">
            <span className="advisor-q-label">2. Target budget in Indian Rupees (INR)</span>
            <div className="advisor-pills-row">
              {BUDGETS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  className={`advisor-pill-btn ${selectedBudget === bg.id ? 'active' : ''}`}
                  onClick={() => setSelectedBudget(bg.id)}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations list */}
          <div className="advisor-results-section">
            <div className="advisor-results-title">
              <span>Recommended Studio Pieces ({recommendations.length})</span>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Handmade in Lucknow, Bagru, Maheshwar, Santiniketan
              </span>
            </div>

            <div className="advisor-results-grid">
              {recommendations.slice(0, 4).map((item) => (
                <div key={item.id} className="advisor-item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="advisor-item-img"
                  />
                  <div className="advisor-item-info">
                    <span className="advisor-item-name">{item.name}</span>
                    <span className="advisor-item-artisan">
                      {item.artisan.studio} ({item.artisan.location.split(',')[0]})
                    </span>
                    <span className="advisor-item-price">
                      {formatINR(item.price)}
                    </span>
                    <button
                      type="button"
                      className="advisor-select-btn"
                      onClick={() => {
                        onClose();
                        if (onSelectProduct) onSelectProduct(item);
                      }}
                    >
                      View & Tailor Piece →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
