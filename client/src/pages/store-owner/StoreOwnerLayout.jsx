// src/pages/store-owner/StoreOwnerLayout.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  Settings,
  BarChart3,
  ExternalLink,
  PlusCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './StoreOwnerLayout.css';

const StoreContext = createContext();

export function useActiveStore() {
  return useContext(StoreContext);
}

export default function StoreOwnerLayout() {
  const { user, token, apiBase } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(() => localStorage.getItem('craftly_active_store_id') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStores() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/stores/my/stores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          const list = json.data || [];
          setStores(list);
          if (list.length > 0) {
            // If currently stored ID is in list, keep it; otherwise default to first
            const exists = list.some((s) => s.id === activeStoreId);
            if (!exists || !activeStoreId) {
              setActiveStoreId(list[0].id);
              localStorage.setItem('craftly_active_store_id', list[0].id);
            }
          }
        } else {
          setError(json.message || 'Failed to load artisan ateliers');
        }
      } catch (err) {
        setError('Network error loading store portfolio');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadStores();
    }
  }, [token, apiBase]);

  const handleSelectStore = (storeId) => {
    setActiveStoreId(storeId);
    localStorage.setItem('craftly_active_store_id', storeId);
  };

  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0] || null;

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        activeStoreId,
        setActiveStoreId: handleSelectStore,
        reloadStores: async () => {
          const res = await fetch(`${apiBase}/stores/my/stores`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (res.ok) setStores(json.data || []);
        },
      }}
    >
      <div className="store-owner-layout">
        {/* Top bar */}
        <header className="store-topbar">
          <div className="store-topbar-left">
            <Link to="/" className="store-brand-pill">
              <span>Craftly</span>
              <span className="store-brand-badge">Artisan Portal</span>
            </Link>

            {stores.length > 0 && (
              <div className="store-selector-wrap">
                <Store size={15} color="var(--color-terracotta)" />
                <select
                  value={activeStoreId}
                  onChange={(e) => handleSelectStore(e.target.value)}
                  className="store-select-input"
                  aria-label="Select Atelier"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studioName || s.name} ({s.status})
                    </option>
                  ))}
                </select>

                {activeStore && (
                  <span className={`store-status-pill ${activeStore.status.toLowerCase()}`}>
                    {activeStore.status}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="store-topbar-right">
            <Link
              to="/store-owner/stores"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Register Atelier</span>
            </Link>

            {activeStore && activeStore.status === 'APPROVED' && (
              <Link
                to={`/stores/${activeStore.slug}`}
                target="_blank"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View Public Store</span>
                <ExternalLink size={13} />
              </Link>
            )}

            <Link
              to="/"
              style={{ fontSize: '13px', color: 'var(--color-sand-700)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={14} />
              <span>Marketplace</span>
            </Link>
          </div>
        </header>

        {/* Notice if active store is Pending or Rejected */}
        {activeStore && activeStore.status !== 'APPROVED' && (
          <div
            style={{
              padding: '12px 24px',
              background: activeStore.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
              borderBottom: `1px solid ${activeStore.status === 'PENDING' ? '#fde68a' : '#fecaca'}`,
              color: activeStore.status === 'PENDING' ? '#92400e' : '#991b1b',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>
                <strong>Atelier Status: {activeStore.status}</strong> —{' '}
                {activeStore.status === 'PENDING'
                  ? 'Your store application is under administrative review by Craftly curation team.'
                  : `This store was not approved: "${activeStore.rejectionReason || 'Does not meet artisan criteria'}".`}
              </span>
            </div>
            <Link to="/store-owner/stores" style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>
              Manage Applications
            </Link>
          </div>
        )}

        <div className="store-layout-body">
          {/* Sidebar */}
          <aside className="store-sidebar">
            <ul className="store-sidebar-nav">
              <li className="store-nav-item">
                <NavLink to="/store-owner" end className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <LayoutDashboard size={17} />
                  <span>Overview</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/stores" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <Store size={17} />
                  <span>My Stores ({stores.length})</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/products" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <Package size={17} />
                  <span>Products</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/inventory" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <Layers size={17} />
                  <span>Inventory & Stock</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/orders" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <ShoppingBag size={17} />
                  <span>Orders & Fulfilment</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/customizations" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <Sparkles size={17} />
                  <span>Custom Inquiries</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/profile" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <Settings size={17} />
                  <span>Atelier Profile</span>
                </NavLink>
              </li>
              <li className="store-nav-item">
                <NavLink to="/store-owner/analytics" className={({ isActive }) => (isActive ? 'store-nav-link active' : 'store-nav-link')}>
                  <BarChart3 size={17} />
                  <span>Revenue Analytics</span>
                </NavLink>
              </li>
            </ul>
          </aside>

          {/* Main content */}
          <main className="store-main-area">
            {loading ? (
              <p style={{ color: 'var(--color-sand-600)' }}>Loading atelier dashboard...</p>
            ) : stores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-sand-200)' }}>
                <Store size={48} style={{ color: 'var(--color-terracotta)', marginBottom: '16px' }} />
                <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)' }}>No Artisan Stores Registered</h2>
                <p style={{ color: 'var(--color-sand-600)', maxWidth: '440px', margin: '0 auto 24px', fontSize: '14px' }}>
                  Register your Indian craft studio, loom workshop, or block print atelier to start listing bespoke products and accepting orders.
                </p>
                <Link to="/store-owner/stores" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  Submit Store Application
                </Link>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </StoreContext.Provider>
  );
}

