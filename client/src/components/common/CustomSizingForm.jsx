// src/components/common/CustomSizingForm.jsx
import React from 'react';
import { Scissors, Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import './CustomSizingForm.css';

export const MEASUREMENT_CONFIG = {
  in: {
    bust: { label: 'Bust / Chest', min: 28, max: 56, default: 36 },
    waist: { label: 'Natural Waist', min: 22, max: 50, default: 30 },
    hips: { label: 'Fullest Hips', min: 30, max: 60, default: 40 },
    shoulder: { label: 'Shoulder Width', min: 12, max: 20, default: 15 },
    sleeveLength: { label: 'Sleeve Length', min: 5, max: 30, default: 18 },
    dressLength: { label: 'Kurta / Dress Length', min: 30, max: 58, default: 44 },
  },
  cm: {
    bust: { label: 'Bust / Chest', min: 70, max: 142, default: 91 },
    waist: { label: 'Natural Waist', min: 55, max: 127, default: 76 },
    hips: { label: 'Fullest Hips', min: 76, max: 152, default: 101 },
    shoulder: { label: 'Shoulder Width', min: 30, max: 51, default: 38 },
    sleeveLength: { label: 'Sleeve Length', min: 12, max: 76, default: 46 },
    dressLength: { label: 'Kurta / Dress Length', min: 76, max: 147, default: 112 },
  },
};

const FIT_OPTIONS = ['Relaxed Comfort', 'Classic Regular', 'Tailored Silhouette'];

/**
 * CustomSizingForm Component
 * Fully validates and manages bespoke dress measurements in both inches and cm
 */
export default function CustomSizingForm({
  measurements,
  onChange,
  errors = {},
  tailoringFee = 350,
}) {
  const currentUnit = measurements.unit || 'in';
  const config = MEASUREMENT_CONFIG[currentUnit];

  const handleUnitToggle = (newUnit) => {
    if (newUnit === currentUnit) return;

    // Convert existing numeric measurements when switching unit
    const updated = { ...measurements, unit: newUnit };
    const factor = newUnit === 'cm' ? 2.54 : 1 / 2.54;

    Object.keys(config).forEach((key) => {
      if (measurements[key] && !isNaN(Number(measurements[key]))) {
        const val = Number(measurements[key]) * factor;
        updated[key] = Math.round(val * 2) / 2; // round to nearest 0.5
      }
    });

    onChange(updated);
  };

  const handleFieldChange = (field, value) => {
    onChange({
      ...measurements,
      [field]: value,
    });
  };

  return (
    <div className="custom-sizing-container">
      {/* Header with Unit Selector */}
      <div className="custom-sizing-header">
        <span className="custom-sizing-title">
          <Scissors size={14} color="var(--color-terracotta)" />
          Bespoke Tailoring Details
        </span>

        <div className="unit-switch-group">
          <button
            type="button"
            className={`unit-btn ${currentUnit === 'in' ? 'active' : ''}`}
            onClick={() => handleUnitToggle('in')}
          >
            Inches (in)
          </button>
          <button
            type="button"
            className={`unit-btn ${currentUnit === 'cm' ? 'active' : ''}`}
            onClick={() => handleUnitToggle('cm')}
          >
            Centimetres (cm)
          </button>
        </div>
      </div>

      {/* 6 Measurement Inputs */}
      <div className="custom-sizing-grid">
        {Object.entries(config).map(([field, rules]) => {
          const hasError = Boolean(errors[field]);
          return (
            <div key={field} className="measurement-field">
              <label className="measurement-label" htmlFor={`meas-${field}`}>
                <span>{rules.label}</span>
                <span className="measurement-range-hint">
                  ({rules.min}–{rules.max} {currentUnit})
                </span>
              </label>

              <div className="measurement-input-wrap">
                <input
                  id={`meas-${field}`}
                  type="number"
                  step="0.5"
                  placeholder={String(rules.default)}
                  value={measurements[field] || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className={`measurement-input ${hasError ? 'error' : ''}`}
                />
                <span className="measurement-unit-badge">{currentUnit}</span>
              </div>

              {hasError && <span className="field-error-msg">{errors[field]}</span>}
            </div>
          );
        })}
      </div>

      {/* Preferred Fit */}
      <div className="fit-preference-group">
        <label className="measurement-label">Preferred Drape & Fit</label>
        <div className="fit-buttons-row">
          {FIT_OPTIONS.map((fit) => (
            <button
              key={fit}
              type="button"
              className={`fit-btn ${measurements.preferredFit === fit ? 'active' : ''}`}
              onClick={() => handleFieldChange('preferredFit', fit)}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Tailoring Instructions */}
      <div className="tailoring-notes-field">
        <label className="measurement-label">Special Atelier Notes (Optional)</label>
        <textarea
          placeholder="e.g., Slightly higher boat neckline, concealed right-hand pocket, add 1-inch ease..."
          value={measurements.tailoringInstructions || ''}
          onChange={(e) => handleFieldChange('tailoringInstructions', e.target.value)}
          className="tailoring-notes-input"
        />
      </div>

      {/* Tailoring Fee Banner */}
      <div className="tailoring-fee-banner">
        <span>
          <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
          Master Artisan Custom Cutting & Pattern Fee:
        </span>
        <span>+{formatINR(tailoringFee)}</span>
      </div>
    </div>
  );
}

/**
 * Validation helper function
 */
export function validateMeasurements(measurements) {
  const unit = measurements.unit || 'in';
  const config = MEASUREMENT_CONFIG[unit];
  const errors = {};

  Object.entries(config).forEach(([field, rules]) => {
    const val = measurements[field];
    if (val === undefined || val === '' || val === null) {
      errors[field] = 'Required measurement';
    } else {
      const num = Number(val);
      if (isNaN(num)) {
        errors[field] = 'Must be a number';
      } else if (num < rules.min || num > rules.max) {
        errors[field] = `Must be between ${rules.min} & ${rules.max} ${unit}`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
