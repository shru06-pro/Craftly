// src/pages/auth/RegisterStorePage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function RegisterStorePage() {
  const { registerStoreOwner } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    craft: '',
    bio: '',
    leadTime: '7-10 business days',
    city: '',
    state: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerStoreOwner({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        storeName: form.storeName,
        craft: form.craft,
        bio: form.bio,
        leadTime: form.leadTime,
        city: form.city,
        state: form.state,
      });

      navigate('/store-owner');
    } catch (err) {
      setError(err.message || 'Store registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card wide">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            Craftly<span>.</span>
          </Link>
          <h1 className="auth-card-title">Register as an Artisan Store Owner</h1>
          <p className="auth-card-subtitle">
            Open your dedicated Indian craft atelier, receive bespoke commissions, and reach conscious patrons nationwide.
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-espresso)', borderBottom: '1px solid var(--color-sand-200)', paddingBottom: '6px', margin: '4px 0 0' }}>
            1. Master Artisan / Owner Credentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label>Master Weaver / Artisan Full Name *</label>
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Ustad Shamim"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Owner Email Address *</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="artisan@atelier.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mobile Contact Number *</label>
              <div className="input-wrap">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password (min 6 characters) *</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-espresso)', borderBottom: '1px solid var(--color-sand-200)', paddingBottom: '6px', margin: '16px 0 0' }}>
            2. Initial Atelier & Craft Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label>Studio / Atelier Brand Name *</label>
              <div className="input-wrap">
                <Store size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Awadh Chikankari Guild"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Craft Specialization *</label>
              <div className="input-wrap">
                <Sparkles size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Chikankari Hand Embroidery"
                  value={form.craft}
                  onChange={(e) => setForm({ ...form, craft: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>City *</label>
              <div className="input-wrap">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>State *</label>
              <div className="input-wrap">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Uttar Pradesh"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Artisan Narrative & Handloom Heritage *</label>
            <div className="input-wrap">
              <textarea
                rows={3}
                required
                placeholder="Share your weaving techniques, natural dyes, wooden block craft, and atelier history..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
            {loading ? 'Submitting Application...' : 'Register Atelier & Submit Application'}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Already registered as a store owner?</span>
          <Link to="/login" className="auth-inline-link">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

