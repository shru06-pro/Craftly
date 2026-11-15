// src/pages/account/CustomerLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Sparkles,
  MapPin,
  Heart,
  LogOut,
  Store,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const { user, logout, isStoreOwner, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = user?.name ? user.name[0].toUpperCase() : 'C';

  return (
    <div className="customer-account-page">
      <div className="container">
        {/* Account Header */}
        <div className="account-header">
          <div className="account-profile-summary">
            <div className="account-avatar">{initial}</div>
            <div>
              <h1 className="account-user-name">{user?.name || 'Craft Patron'}</h1>
              <div className="account-user-meta">
                <span>{user?.email || user?.phone || 'Patron Account'}</span>
                <span>•</span>
                <span className="account-role-badge">{user?.role || 'CUSTOMER'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {isStoreOwner && (
              <NavLink to="/store-owner" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={16} />
                <span>Store Dashboard</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--color-terracotta)' }}>
                <Shield size={16} color="var(--color-terracotta)" />
                <span>Admin Suite</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="account-grid">
          {/* Navigation Sidebar */}
          <aside className="account-sidebar">
            <ul className="account-nav-list">
              <li className="account-nav-item">
                <NavLink to="/account" end className={({ isActive }) => (isActive ? 'account-nav-link active' : 'account-nav-link')}>
                  <User size={18} />
                  <span>Personal Profile</span>
                </NavLink>
              </li>
              <li className="account-nav-item">
                <NavLink to="/account/orders" className={({ isActive }) => (isActive ? 'account-nav-link active' : 'account-nav-link')}>
                  <ShoppingBag size={18} />
                  <span>My Orders</span>
                </NavLink>
              </li>
              <li className="account-nav-item">
                <NavLink to="/account/customizations" className={({ isActive }) => (isActive ? 'account-nav-link active' : 'account-nav-link')}>
                  <Sparkles size={18} />
                  <span>Customization Requests</span>
                </NavLink>
              </li>
              <li className="account-nav-item">
                <NavLink to="/account/preferences" className={({ isActive }) => (isActive ? 'account-nav-link active' : 'account-nav-link')}>
                  <SlidersHorizontal size={18} />
                  <span>Shopping Preferences</span>
                </NavLink>
              </li>
              <li className="account-nav-item">
                <NavLink to="/account/addresses" className={({ isActive }) => (isActive ? 'account-nav-link active' : 'account-nav-link')}>
                  <MapPin size={18} />
                  <span>Saved Addresses</span>
                </NavLink>
              </li>
              <li className="account-nav-item">
                <NavLink to="/wishlist" className="account-nav-link">
                  <Heart size={18} />
                  <span>Saved Wishlist</span>
                </NavLink>
              </li>
              <li className="account-nav-item" style={{ borderTop: '1px solid var(--color-sand-200)', marginTop: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={handleLogout} className="account-nav-link logout-link">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </aside>

          {/* Subpage content */}
          <main className="account-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

