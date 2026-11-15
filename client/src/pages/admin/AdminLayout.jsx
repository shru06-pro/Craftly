// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  Store,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  UserCheck,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Admin Topbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <Link to="/" className="admin-brand">
            <span>Craftly</span>
            <span className="admin-badge">
              {isSuperAdmin ? 'Super Admin' : 'Admin Control'}
            </span>
          </Link>
        </div>

        <div className="admin-topbar-right">
          <span>
            Signed in as <strong>{user?.name || user?.email}</strong>
          </span>

          <Link
            to="/"
            style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={14} />
            <span>Marketplace</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="admin-layout-body">
        {/* Admin Navigation Sidebar */}
        <aside className="admin-sidebar">
          <ul className="admin-sidebar-nav">
            <li className="admin-nav-item">
              <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/store-applications" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <FileCheck size={18} />
                <span>Store Applications</span>
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/stores" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <Store size={18} />
                <span>Store Management</span>
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <Package size={18} />
                <span>Product Moderation</span>
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <ShoppingBag size={18} />
                <span>Order Monitoring</span>
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <Users size={18} />
                <span>Customer Accounts</span>
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                <BarChart3 size={18} />
                <span>Platform Analytics</span>
              </NavLink>
            </li>

            {/* Super Admin Only link */}
            {isSuperAdmin && (
              <li className="admin-nav-item" style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '8px' }}>
                <NavLink to="/admin/administrators" className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}>
                  <UserCheck size={18} />
                  <span>Admin Team (Super)</span>
                </NavLink>
              </li>
            )}
          </ul>
        </aside>

        {/* Content Outlet */}
        <main className="admin-main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

