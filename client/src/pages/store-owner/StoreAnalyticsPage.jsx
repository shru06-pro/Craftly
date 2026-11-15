// src/pages/store-owner/StoreAnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Package, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';
import { formatCurrency } from '../../utils/formatCurrency';

export default function StoreAnalyticsPage() {
  const { token, apiBase } = useAuth();
  const { activeStore } = useActiveStore();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!activeStore) return;
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/stores/my/stores/${activeStore.id}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setAnalytics(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [activeStore, token, apiBase]);

  if (!activeStore) return <p>Please select an atelier.</p>;

  return (
    <div>
      <h1 className="store-header-title">Atelier Revenue & Performance Analytics</h1>
      <p className="store-header-subtitle">
        Direct patronage, commission volume, and product demand metrics for {activeStore.studioName || activeStore.name}.
      </p>

      {/* Overview KPI Cards */}
      <div className="store-stats-grid">
        <div className="store-stat-card">
          <div className="store-stat-icon">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="store-stat-val">{formatCurrency(analytics?.grossSales || 0)}</div>
            <div className="store-stat-lbl">Lifetime Sales Volume</div>
          </div>
        </div>

        <div className="store-stat-card">
          <div className="store-stat-icon">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="store-stat-val">{analytics?.totalOrders || 0}</div>
            <div className="store-stat-lbl">Commissions Completed</div>
          </div>
        </div>

        <div className="store-stat-card">
          <div className="store-stat-icon">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="store-stat-val">
              {formatCurrency(
                analytics?.totalOrders ? Math.round(analytics.grossSales / analytics.totalOrders) : 0
              )}
            </div>
            <div className="store-stat-lbl">Avg Order Value (AOV)</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Representation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: '0 0 16px' }}>
            Commission Status Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Fulfilled & Delivered</span>
                <span style={{ fontWeight: 600 }}>{analytics?.deliveredOrders || analytics?.totalOrders || 0}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--color-sand-100)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: '#2b7430' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>In Loom Tailoring</span>
                <span style={{ fontWeight: 600 }}>{analytics?.inProductionOrders || 0}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--color-sand-100)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: 'var(--color-terracotta)' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: '0 0 16px' }}>
            Fair Artisan Wage Share
          </h3>
          <div style={{ padding: '16px', background: '#fcf8f2', borderRadius: '6px', border: '1px solid var(--color-sand-200)' }}>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-espresso)', margin: 0 }}>
              Under Craftly's transparent zero-middleman protocol, <strong>85%+ of patron spend</strong> flows directly to your atelier cooperative bank account on delivery verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

