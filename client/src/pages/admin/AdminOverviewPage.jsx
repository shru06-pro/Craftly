// src/pages/admin/AdminOverviewPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Store,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminOverviewPage() {
  const { token, apiBase } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        const [statsRes, appsRes] = await Promise.all([
          fetch(`${apiBase}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiBase}/admin/store-applications?status=PENDING`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) {
          const sJson = await statsRes.json();
          setStats(sJson.data);
        }
        if (appsRes.ok) {
          const aJson = await appsRes.json();
          setPendingApps(aJson.data || []);
        }
      } catch (e) {
        console.error('Error loading admin overview:', e);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadOverview();
    }
  }, [token, apiBase]);

  return (
    <div>
      <h1 className="admin-page-title">Marketplace Administration Overview</h1>
      <p className="admin-page-subtitle">
        Centralized monitoring, artisan curation, multi-vendor transactions, and compliance.
      </p>

      {/* Pending Applications Banner */}
      {pendingApps.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#b45309" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '14px' }}>
                {pendingApps.length} Artisan Store Application{pendingApps.length > 1 ? 's' : ''} Awaiting Review
              </strong>
              <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                Verify artisan heritage documentation and handloom credentials to approve or reject.
              </div>
            </div>
          </div>
          <Link
            to="/admin/store-applications"
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '8px 16px', background: '#b45309', borderColor: '#b45309' }}
          >
            Review Applications
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{formatCurrency(stats?.gmv || 0)}</div>
            <div className="admin-stat-lbl">Gross Marketplace Value (GMV)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Store size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{stats?.totalStores || 0}</div>
            <div className="admin-stat-lbl">Active Curated Ateliers</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Package size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{stats?.totalProducts || 0}</div>
            <div className="admin-stat-lbl">Catalogued Crafts</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{stats?.totalOrders || 0}</div>
            <div className="admin-stat-lbl">Marketplace Commissions</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{stats?.totalCustomers || 0}</div>
            <div className="admin-stat-lbl">Registered Patrons</div>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#0f172a', margin: '0 0 8px' }}>
            Store Approval Queue
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Inspect workshop credentials, artisan bios, regional crafts, and lead times before activating new stores.
          </p>
          <Link
            to="/admin/store-applications"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-terracotta)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
          >
            <span>Open Application Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#0f172a', margin: '0 0 8px' }}>
            Product Catalog Moderation
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Audit listings for authentic handloom tags, GI tag adherence, and correct fabric pricing.
          </p>
          <Link
            to="/admin/products"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-terracotta)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
          >
            <span>Inspect Marketplace Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

