// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Heart,
  User
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import AuthModal from '../common/AuthModal';
import './Navbar.css';

/**
 * Navbar Component
 * Refined, spacious layout:
 * - Left: Craftly Brand Logo
 * - Center: Navigation Links (Collections, Chikankari Bench, Master Ateliers, Maker Manifesto)
 * - Right: Search Bar -> Account -> Wishlist -> Cart
 */
export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('signin');

  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (window.location.pathname === '/') {
      const el = document.getElementById('collections');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      const searchInput = document.querySelector('.catalog-search-input');
      if (searchInput) {
        searchInput.value = q;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      navigate(`/?search=${encodeURIComponent(q)}#collections`);
    }
    setMobileMenuOpen(false);
  };

  const handleNavScroll = (targetId) => {
    setMobileMenuOpen(false);
    if (window.location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  const openAuth = (mode = 'signin') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
    setMobileMenuOpen(false);
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
            <span className="brand-subtitle">Indian Handlooms & Bespoke Craft</span>
          </Link>

          {/* 2. Main Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={() => handleNavScroll('collections')}
                >
                  Collections
                </NavLink>
              </li>
              <li>
                <a
                  href="#customizer"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll('customizer');
                  }}
                >
                  Chikankari Bench
                </a>
              </li>
              <li>
                <a
                  href="#artisan-spotlight"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll('artisan-spotlight');
                  }}
                >
                  Master Ateliers
                </a>
              </li>
              <li>
                <a
                  href="#manifesto"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll('manifesto');
                  }}
                >
                  Maker Manifesto
                </a>
              </li>
            </ul>
          </nav>

          {/* 3. Action Group: Search -> Craft Advisor -> Account -> Wishlist -> Cart */}
          <div className="nav-actions">
            {/* Search Bar after navigation */}
            <form className="nav-search-wrap" onSubmit={handleSearchSubmit}>
              <Search size={14} className="nav-search-icon" />
              <input
                type="text"
                placeholder="Search Chikankari, Bagru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
                aria-label="Search Indian crafts or fabrics"
              />
            </form>

            {/* Account Icon (Minimalist Outline User Button) */}
            <button
              type="button"
              className="icon-button"
              onClick={() => openAuth('signin')}
              title="Account (Sign In / Register)"
              aria-label="Open Account Login and Sign Up"
            >
              <User size={18} />
            </button>

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
                <Link to="/" onClick={() => handleNavScroll('collections')}>
                  Curated Collections
                </Link>
              </li>
              <li>
                <a
                  href="#customizer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll('customizer');
                  }}
                >
                  Bespoke Chikankari Bench
                </a>
              </li>
              <li>
                <a
                  href="#artisan-spotlight"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll('artisan-spotlight');
                  }}
                >
                  Master Ateliers & Weavers
                </a>
              </li>
              <li>
                <a
                  href="#manifesto"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll('manifesto');
                  }}
                >
                  Indian Maker Manifesto
                </a>
              </li>
            </ul>

            <div className="mobile-menu-divider" />

            {/* Mobile Actions: Account & Advisor */}
            <div className="mobile-extra-actions">
              <button
                type="button"
                className="mobile-extra-btn auth"
                onClick={() => openAuth('signin')}
              >
                <User size={16} />
                <span>Sign In / Create Account</span>
              </button>

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
