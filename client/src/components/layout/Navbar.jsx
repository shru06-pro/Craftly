// src/components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Heart,
  User,
  Store,
  Shield,
  Sparkles,
  LogOut,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../common/AuthModal';
import './Navbar.css';

/**
 * Navbar Component
 * Refined, spacious layout:
 * - Left: Craftly Brand Logo
 * - Center: Navigation Links (Marketplace / Shop, Ateliers, About, Contact)
 * - Right: Search Bar -> Role-Aware Account -> Wishlist -> Cart
 */
export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('signin');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, isStoreOwner, isAdmin, logout } = useAuth();

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setMobileMenuOpen(false);
  };

  const openAuth = (mode = 'signin') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setAccountDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="navbar">
        <div className="container navbar-container">
          {/* 1. Craftly Brand Logo on the Left */}
          <Link to="/" className="brand-link" aria-label="Craftly Home">
            <span className="brand-title">
              Craftly
              <span className="brand-title-dot" aria-hidden="true"></span>
            </span>
            <span className="brand-subtitle">India's Women's Fashion & Lifestyle Marketplace</span>
          </Link>

          {/* 2. Main Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/shop"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Shop Marketplace
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/stores"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Artisan Stores
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* 3. Action Group: Search -> Account -> Wishlist -> Cart */}
          <div className="nav-actions">
            {/* Search Bar after navigation */}
            <form className="nav-search-wrap" onSubmit={handleSearchSubmit}>
              <Search size={14} className="nav-search-icon" />
              <input
                type="text"
                placeholder="Search Chikankari, Bagru, silk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
                aria-label="Search Indian crafts or fabrics"
              />
            </form>

            {/* Account Icon with Role-Aware Dropdown */}
            <div className="account-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  if (isAuthenticated) {
                    setAccountDropdownOpen(!accountDropdownOpen);
                  } else {
                    openAuth('signin');
                  }
                }}
                title={isAuthenticated ? `Account (${user?.name || 'Patron'})` : 'Account (Sign In / Register)'}
                aria-label="Open Account Menu"
              >
                <User size={18} color={isAuthenticated ? 'var(--color-terracotta)' : 'currentColor'} />
              </button>

              {/* Dropdown Menu when logged in */}
              {isAuthenticated && accountDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 12px)',
                    background: '#ffffff',
                    border: '1px solid var(--color-sand-200)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(30, 24, 18, 0.1)',
                    width: '240px',
                    padding: '12px 0',
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-sand-100)', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-espresso)' }}>{user?.name || 'Craft Patron'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-sand-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</div>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setAccountDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', fontSize: '13px', color: 'var(--color-espresso)', textDecoration: 'none' }}
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/account/orders"
                    onClick={() => setAccountDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', fontSize: '13px', color: 'var(--color-espresso)', textDecoration: 'none' }}
                  >
                    <ShoppingBag size={15} />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/account/customizations"
                    onClick={() => setAccountDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', fontSize: '13px', color: 'var(--color-espresso)', textDecoration: 'none' }}
                  >
                    <Sparkles size={15} />
                    <span>Custom Inquiries</span>
                  </Link>

                  <Link
                    to="/account/preferences"
                    onClick={() => setAccountDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', fontSize: '13px', color: 'var(--color-espresso)', textDecoration: 'none' }}
                  >
                    <SlidersHorizontal size={15} />
                    <span>Shopping Preferences</span>
                  </Link>

                  {isStoreOwner && (
                    <Link
                      to="/store-owner"
                      onClick={() => setAccountDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', fontSize: '13px', color: 'var(--color-terracotta)', fontWeight: 600, textDecoration: 'none', background: 'var(--color-sand-50)' }}
                    >
                      <Store size={15} />
                      <span>Store Dashboard</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAccountDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', fontSize: '13px', color: '#1e3a5f', fontWeight: 600, textDecoration: 'none', background: '#f8fafc' }}
                    >
                      <Shield size={15} />
                      <span>Admin Control</span>
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-sand-100)', marginTop: '6px', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        fontSize: '13px',
                        color: '#b91c1c',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Icon Button */}
            <Link
              to="/wishlist"
              className="icon-button"
              title="Saved Studio Pieces"
              aria-label={`Wishlist with ${wishlistCount} saved pieces`}
            >
              <Heart
                size={18}
                fill={wishlistCount > 0 ? 'var(--color-terracotta)' : 'none'}
                color={wishlistCount > 0 ? 'var(--color-terracotta)' : 'currentColor'}
              />
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </Link>

            {/* Cart Icon Button */}
            <button
              type="button"
              className="icon-button"
              title="View Studio Bag"
              aria-label={`Studio bag with ${cartCount} items`}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="icon-button mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 4. Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer" role="dialog" aria-label="Mobile Navigation">
            {/* In-Drawer Mobile Search */}
            <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
              <Search size={15} className="mobile-search-icon" />
              <input
                type="text"
                placeholder="Search Chikankari, Bagru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
                aria-label="Search items"
              />
            </form>

            <ul className="mobile-nav-links">
              <li>
                <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>
                  Shop Marketplace
                </Link>
              </li>
              <li>
                <Link to="/stores" onClick={() => setMobileMenuOpen(false)}>
                  Artisan Stores
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
              </li>
              {isStoreOwner && (
                <li>
                  <Link to="/store-owner" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
                    Store Owner Dashboard
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1e3a5f', fontWeight: 600 }}>
                    Admin Control Suite
                  </Link>
                </li>
              )}
            </ul>

            <div className="mobile-menu-divider" />

            {/* Mobile Actions: Account & Wishlist */}
            <div className="mobile-extra-actions">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    className="mobile-extra-btn auth"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>My Account ({user?.name || 'Patron'})</span>
                  </Link>
                  <Link
                    to="/account/preferences"
                    className="mobile-extra-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <SlidersHorizontal size={16} />
                    <span>Shopping Preferences</span>
                  </Link>
                  <button
                    type="button"
                    className="mobile-extra-btn"
                    onClick={handleSignOut}
                    style={{ color: '#b91c1c' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="mobile-extra-btn auth"
                  onClick={() => openAuth('signin')}
                >
                  <User size={16} />
                  <span>Sign In / Create Account</span>
                </button>
              )}

              <Link
                to="/wishlist"
                className="mobile-extra-btn wishlist"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={16} color="var(--color-terracotta)" />
                <span>Saved Wishlist ({wishlistCount} pieces)</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Login & Sign Up Modal Interface */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />
    </>
  );
}
