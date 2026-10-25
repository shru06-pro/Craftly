// src/components/common/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import './AuthModal.css';

/**
 * AuthModal Component
 * Provides a client-side Login / Sign Up interface matching Craftly's warm artisanal identity.
 * Includes field validation, password visibility toggles, and an explicit disclaimer
 * indicating that real backend authentication is not yet connected.
 */
export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'

  // Form states
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  // Sync mode with prop when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
      setFeedbackNotice(null);
    }
  }, [isOpen, initialMode]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation logic
  const validateSignin = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signinData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(signinData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!signinData.password) {
      newErrors.password = 'Password is required.';
    } else if (signinData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signupData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (signupData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!signupData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(signupData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required.';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (signupData.confirmPassword !== signupData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!signupData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the terms to create an account.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitSignin = (e) => {
    e.preventDefault();
    if (validateSignin()) {
      // Clear previous errors
      setErrors({});
      // Do not fake login or create mock sessions. Inform user honestly:
      setFeedbackNotice({
        type: 'info',
        title: 'Validation Successful (Frontend Demonstration)',
        text: `Client-side credentials for ${signinData.email} validated successfully. No user was logged in because a backend authentication provider (e.g. Firebase, Supabase, or custom auth server) is not yet connected to this project.`,
      });
    }
  };

  const handleSubmitSignup = (e) => {
    e.preventDefault();
    if (validateSignup()) {
      // Clear previous errors
      setErrors({});
      // Do not fake signup or create mock sessions. Inform user honestly:
      setFeedbackNotice({
        type: 'info',
        title: 'Account Form Validated (Frontend Demonstration)',
        text: `Welcome inquiry for ${signupData.name} (${signupData.email}) validated successfully. To persist real user profiles and manage passwords, connect an authentication backend.`,
      });
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setFeedbackNotice(null);
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="auth-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          <div className="auth-brand-kicker">
            <Sparkles size={14} color="var(--color-terracotta)" />
            <span>Craftly Patron Atelier</span>
          </div>
          <h2 id="auth-modal-title" className="auth-title">
            {mode === 'signin' ? 'Welcome Back to the Atelier' : 'Join the Artisan Guild'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin'
              ? 'Sign in to access your saved bespoke orders, measurement cards, and order tracking.'
              : 'Create an account to save custom sizes, track heirloom orders, and receive private drops.'}
          </p>

          {/* Explicit Backend Disclaimer Banner */}
          <div className="auth-disclaimer-banner">
            <ShieldAlert size={16} className="auth-disclaimer-icon" />
            <div className="auth-disclaimer-text">
              <strong>Frontend UI Only:</strong> Real backend authentication is not configured.
              Inputs are validated on client side, but no real accounts or login sessions are stored.
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs-row">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alert if Form Validated */}
        {feedbackNotice && (
          <div className="auth-feedback-box">
            <CheckCircle2 size={18} className="auth-feedback-icon" />
            <div>
              <strong>{feedbackNotice.title}</strong>
              <p>{feedbackNotice.text}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        {mode === 'signin' ? (
          <form className="auth-form" onSubmit={handleSubmitSignin} noValidate>
            {/* Email Field */}
            <div className="auth-field-group">
              <label htmlFor="signin-email" className="auth-label">
                Email Address
              </label>
              <div className={`auth-input-wrap ${errors.email ? 'error' : ''}`}>
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="signin-email"
                  type="email"
                  placeholder="patron@example.com"
                  value={signinData.email}
                  onChange={(e) =>
                    setSigninData({ ...signinData, email: e.target.value })
                  }
                  className="auth-input"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'signin-email-error' : undefined}
                />
              </div>
              {errors.email && (
                <span id="signin-email-error" className="auth-error-msg">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="auth-field-group">
              <div className="auth-label-row">
                <label htmlFor="signin-password" className="auth-label">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-link-hint"
                  onClick={() =>
                    setFeedbackNotice({
                      type: 'info',
                      title: 'Password Reset',
                      text: 'Password recovery will be available once the authentication backend is connected.',
                    })
                  }
                >
                  Forgot password?
                </button>
              </div>
              <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signinData.password}
                  onChange={(e) =>
                    setSigninData({ ...signinData, password: e.target.value })
                  }
                  className="auth-input"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'signin-password-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span id="signin-password-error" className="auth-error-msg">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me */}
            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={signinData.rememberMe}
                  onChange={(e) =>
                    setSigninData({ ...signinData, rememberMe: e.target.checked })
                  }
                  className="auth-checkbox"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn">
              <span>Sign In to Atelier</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmitSignup} noValidate>
            {/* Full Name */}
            <div className="auth-field-group">
              <label htmlFor="signup-name" className="auth-label">
                Full Name
              </label>
              <div className={`auth-input-wrap ${errors.name ? 'error' : ''}`}>
                <User size={16} className="auth-field-icon" />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Aarav Sharma"
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({ ...signupData, name: e.target.value })
                  }
                  className="auth-input"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'signup-name-error' : undefined}
                />
              </div>
              {errors.name && (
                <span id="signup-name-error" className="auth-error-msg">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="auth-field-group">
              <label htmlFor="signup-email" className="auth-label">
                Email Address
              </label>
              <div className={`auth-input-wrap ${errors.email ? 'error' : ''}`}>
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="aarav@example.com"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  className="auth-input"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                />
              </div>
              {errors.email && (
                <span id="signup-email-error" className="auth-error-msg">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="auth-field-group">
              <label htmlFor="signup-password" className="auth-label">
                Create Password
              </label>
              <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  className="auth-input"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'signup-password-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span id="signup-password-error" className="auth-error-msg">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field-group">
              <label htmlFor="signup-confirm-password" className="auth-label">
                Confirm Password
              </label>
              <div className={`auth-input-wrap ${errors.confirmPassword ? 'error' : ''}`}>
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({ ...signupData, confirmPassword: e.target.value })
                  }
                  className="auth-input"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span id="signup-confirm-error" className="auth-error-msg">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={signupData.agreeTerms}
                  onChange={(e) =>
                    setSignupData({ ...signupData, agreeTerms: e.target.checked })
                  }
                  className="auth-checkbox"
                />
                <span>I agree to Craftly's Handloom Ethos & Privacy Guidelines</span>
              </label>
            </div>
            {errors.agreeTerms && (
              <span className="auth-error-msg" style={{ marginTop: '-4px' }}>
                {errors.agreeTerms}
              </span>
            )}

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn">
              <span>Create Artisan Account</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Modal Footer Switch Link */}
        <div className="auth-footer-prompt">
          {mode === 'signin' ? (
            <p>
              New to Craftly?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode('signup')}
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an atelier account?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode('signin')}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
