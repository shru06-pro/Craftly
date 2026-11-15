// src/pages/store-owner/StoreDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';
import { formatCurrency } from '../../utils/formatCurrency';

export default function StoreDashboardPage() {
  const { token, apiBase } = useAuth();
  const { activeStore } = useActiveStore();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      if (!activeStore) return;
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/stores/my/stores/${activeStore.id}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setAnalytics(json.data);
        } else {
          setError(json.message || 'Failed to load atelier analytics');
        }
      } catch (err) {
        setError('Network error loading analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [activeStore, token, apiBase]);

  if (!activeStore) {
    return <p>Please select an artisan atelier.</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="store-header-title">{activeStore.studioName || activeStore.name}</h1>
          <p className="store-header-subtitle" style={{ margin: 0 }}>
            {activeStore.craft} • {activeStore.city ? `${activeStore.city}, ` : ''}{activeStore.state || 'India'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/store-owner/products" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            Manage Products
          </Link>
          <Link to="/store-owner/orders" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            View Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="store-stats-grid">
        <div className="store-stat-card">
          <div className="store-stat-icon">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="store-stat-val">{formatCurrency(analytics?.grossSales || 0)}</div>
            <div className="store-stat-lbl">Gross Atelier Revenue</div>
          </div>
        </div>

        <div className="store-stat-card">
          <div className="store-stat-icon">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="store-stat-val">{analytics?.totalOrders || 0}</div>
            <div className="store-stat-lbl">Commission Orders</div>
          </div>
        </div>

        <div className="store-stat-card">
          <div className="store-stat-icon">
            <Package size={24} />
          </div>
          <div>
            <div className="store-stat-val">{analytics?.totalProducts || 0}</div>
            <div className="store-stat-lbl">Active Products</div>
          </div>
        </div>

        <div className="store-stat-card">
          <div className="store-stat-icon" style={{ color: analytics?.lowStockCount > 0 ? '#b91c1c' : 'var(--color-terracotta)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="store-stat-val" style={{ color: analytics?.lowStockCount > 0 ? '#b91c1c' : 'inherit' }}>
              {analytics?.lowStockCount || 0}
            </div>
            <div className="store-stat-lbl">Low Stock Alerts (&lt;5 units)</div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <TrendingUp size={20} color="var(--color-terracotta)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: 0 }}>
              Order Fulfilment Pipeline
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-sand-600)', marginBottom: '16px' }}>
            Manage loom milestones, prepare handloom packaging, and dispatch shipments with courier tracking.
          </p>
          <Link
            to="/store-owner/orders"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-terracotta)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
          >
            <span>Review pending dispatches</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Sparkles size={20} color="var(--color-terracotta)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: 0 }}>
              Bespoke Custom Inquiries
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-sand-600)', marginBottom: '16px' }}>
            Review customer design briefs, examine reference images, quote custom artisan pricing, and confirm bespoke commissions.
          </p>
          <Link
            to="/store-owner/customizations"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-terracotta)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
          >
            <span>Open Customization Inbox</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

