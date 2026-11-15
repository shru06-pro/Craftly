// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Phone, KeyRound, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockCodeNotice, setMockCodeNotice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      // Route intelligently based on user role if no specific redirect
      if (redirect === '/') {
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
          navigate('/admin');
        } else if (user.role === 'STORE_OWNER') {
          navigate('/store-owner');
        } else {
          navigate('/account');
        }
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await sendPhoneOtp(phone);
      setOtpSent(true);
      if (res.code) {
        setMockCodeNotice(res.code);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await verifyPhoneOtp(phone, otp);
      if (redirect === '/') {
        navigate('/account');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setAuthMethod('email');
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            Craftly<span>.</span>
          </Link>
          <h1 className="auth-card-title">Welcome to the Atelier</h1>
          <p className="auth-card-subtitle">
            Sign in to access your bespoke commissions, artisan studio, or administrative suite.
          </p>
        </div>

        {/* Tab switcher: Email vs Phone OTP */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('email'); setError(null); }}
          >
            <Mail size={15} />
            <span>Email Password</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('phone'); setError(null); }}
          >
            <Phone size={15} />
            <span>Phone OTP</span>
          </button>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {authMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@craftly.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
              {loading ? 'Authenticating...' : 'Sign In to Craftly'}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Mobile Number (with country code)</label>
                  <div className="input-wrap">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
                  {loading ? 'Sending Verification Code...' : 'Get Instant OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                {mockCodeNotice && (
                  <div className="auth-alert info">
                    <CheckCircle2 size={16} />
                    <span>Mock SMS Dispatch Code: <strong>{mockCodeNotice}</strong></span>
                  </div>
                )}

                <div className="form-group">
                  <label>Enter 6-digit Code sent to {phone}</label>
                  <div className="input-wrap">
                    <KeyRound size={16} className="input-icon" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Change Phone
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '10px' }}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="auth-footer-links">
          <span>New to Craftly?</span>
          <Link to="/register" className="auth-inline-link">
            Create Patron Account
          </Link>
          <span style={{ margin: '0 6px' }}>•</span>
          <Link to="/register-store" className="auth-inline-link">
            Open Artisan Store
          </Link>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="demo-accounts-box">
          <span className="demo-accounts-title">Quick Demo Logins</span>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleFillDemo('superadmin@craftly.in', 'Craftly@SuperAdmin2026!')}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleFillDemo('storeadmin@craftly.in', 'Craftly@Admin2026!')}
            >
              🛡️ Approval Admin
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleFillDemo('owner@craftly.in', 'craftly123')}
            >
              🏺 Store Owner
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleFillDemo('customer@craftly.in', 'craftly123')}
            >
              🛍️ Patron Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

