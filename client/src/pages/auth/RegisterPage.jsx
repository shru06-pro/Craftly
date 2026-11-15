// src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      await registerCustomer({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            Craftly<span>.</span>
          </Link>
          <h1 className="auth-card-title">Join the Craft Patronage</h1>
          <p className="auth-card-subtitle">
            Create an account to commission bespoke Chikankari, track loom milestones, and save artisan pieces.
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                type="text"
                required
                placeholder="e.g. Kavita Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                placeholder="kavita@example.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mobile Number (Optional, for SMS milestones)</label>
            <div className="input-wrap">
              <Phone size={16} className="input-icon" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
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

          <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
            {loading ? 'Creating Account...' : 'Create Patron Account'}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-inline-link">
            Sign In
          </Link>
          <div style={{ marginTop: '8px' }}>
            <span>Are you a weaver or artisan?</span>
            <Link to="/register-store" className="auth-inline-link">
              Register as Store Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

