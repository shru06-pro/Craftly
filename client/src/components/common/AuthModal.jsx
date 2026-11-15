// src/components/common/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const { login, registerCustomer, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'

  // Email state
  const [signinData, setSigninData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtpNotice, setMockOtpNotice] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
      setOtpSent(false);
      setMockOtpNotice(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await login(signinData.email, signinData.password);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await registerCustomer({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone || undefined,
        password: signupData.password,
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrors({ phone: 'Enter a valid mobile number' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await sendPhoneOtp(phone);
      setOtpSent(true);
      if (res.code) {
        setMockOtpNotice(res.code);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrors({ otp: 'Enter verification code' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await verifyPhoneOtp(phone, otp);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (email, pass) => {
    setAuthMethod('email');
    setSigninData({ email, password: pass });
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close Authentication Modal"
        >
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-brand">
            Craftly<span>.</span>
          </div>
          <h2 className="auth-modal-title">
            {mode === 'signin' ? 'Welcome Back to the Atelier' : 'Begin Your Craft Journey'}
          </h2>
          <p className="auth-modal-subtitle">
            {mode === 'signin'
              ? 'Access saved artisan commissions and bespoke sizing profiles'
              : 'Support authentic Indian weaver communities and fair craft wages'}
          </p>
        </div>

        {/* Tab switcher: Email vs Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--color-sand-100)', padding: '4px', borderRadius: '6px', marginBottom: '18px', gap: '4px' }}>
          <button
            type="button"
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              background: authMethod === 'email' ? '#fff' : 'transparent',
              color: authMethod === 'email' ? 'var(--color-espresso)' : 'var(--color-sand-600)',
              cursor: 'pointer',
            }}
            onClick={() => { setAuthMethod('email'); setErrors({}); }}
          >
            Email & Password
          </button>
          <button
            type="button"
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              background: authMethod === 'phone' ? '#fff' : 'transparent',
              color: authMethod === 'phone' ? 'var(--color-espresso)' : 'var(--color-sand-600)',
              cursor: 'pointer',
            }}
            onClick={() => { setAuthMethod('phone'); setErrors({}); }}
          >
            Phone OTP
          </button>
        </div>

        {errors.form && (
          <div className="auth-notice error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        {authMethod === 'email' ? (
          mode === 'signin' ? (
            <form onSubmit={handleSubmitSignin} className="auth-form-content">
              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="patron@craftly.in"
                    value={signinData.email}
                    onChange={(e) => setSigninData({ ...signinData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={signinData.password}
                    onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary auth-submit-button">
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitSignup} className="auth-form-content">
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Aarav Sen"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="aarav@domain.in"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary auth-submit-button">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )
        ) : (
          <div className="auth-form-content">
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="auth-input-group">
                  <label>Mobile Number (with country code)</label>
                  <div className="auth-input-wrapper">
                    <Phone size={16} className="auth-input-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary auth-submit-button">
                  {loading ? 'Dispatching...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                {mockOtpNotice && (
                  <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
                    Mock SMS Dispatch: <strong>{mockOtpNotice}</strong>
                  </div>
                )}
                <div className="auth-input-group">
                  <label>Verification Code</label>
                  <div className="auth-input-wrapper">
                    <KeyRound size={16} className="auth-input-icon" />
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

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px' }}
                  >
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '8px' }}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="auth-modal-footer">
          {mode === 'signin' ? (
            <p>
              New to Craftly?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => { setMode('signup'); setErrors({}); }}
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already a patron?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => { setMode('signin'); setErrors({}); }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Demo fast-fill buttons */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--color-sand-200)', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-sand-500)', fontWeight: 600 }}>
            Quick Demo Logins
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => fillQuickDemo('superadmin@craftly.in', 'Craftly@SuperAdmin2026!')}
              style={{ fontSize: '11px', padding: '3px 6px', background: 'var(--color-sand-100)', border: '1px solid var(--color-sand-300)', borderRadius: '4px', cursor: 'pointer' }}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('owner@craftly.in', 'craftly123')}
              style={{ fontSize: '11px', padding: '3px 6px', background: 'var(--color-sand-100)', border: '1px solid var(--color-sand-300)', borderRadius: '4px', cursor: 'pointer' }}
            >
              🏺 Store Owner
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('customer@craftly.in', 'craftly123')}
              style={{ fontSize: '11px', padding: '3px 6px', background: 'var(--color-sand-100)', border: '1px solid var(--color-sand-300)', borderRadius: '4px', cursor: 'pointer' }}
            >
              🛍️ Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
