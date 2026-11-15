// src/pages/admin/AdminAnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Store, Users, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminAnalyticsPage() {
  const { token, apiBase } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setStats(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token, apiBase]);

  const gmv = stats?.gmv || 0;
  const artisanPayouts = Math.round(gmv * 0.85);
  const platformRevenue = gmv - artisanPayouts;

  return (
    <div>
      <h1 className="admin-page-title">Marketplace Financial & Platform Analytics</h1>
      <p className="admin-page-subtitle">
        Gross Marketplace Value (GMV), fair artisan revenue distribution, and multi-vendor scale indicators.
      </p>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{formatCurrency(gmv)}</div>
            <div className="admin-stat-lbl">Gross Marketplace Value (GMV)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#166534' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="admin-stat-val" style={{ color: '#166534' }}>{formatCurrency(artisanPayouts)}</div>
            <div className="admin-stat-lbl">Direct Artisan Dispatches (85%)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: 'var(--color-indigo, #1e3a5f)' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="admin-stat-val">{formatCurrency(platformRevenue)}</div>
            <div className="admin-stat-lbl">Platform Curation Margin (15%)</div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#0f172a', margin: '0 0 16px' }}>
            Regional Craft Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Lucknow Chikankari & Zardozi (Uttar Pradesh)</span>
                <span style={{ fontWeight: 600 }}>45%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', background: 'var(--color-terracotta)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Bagru & Sanganeri Block Prints (Rajasthan)</span>
                <span style={{ fontWeight: 600 }}>25%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', background: '#c89d42' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Kutch Ajrakh & Rogan (Gujarat)</span>
                <span style={{ fontWeight: 600 }}>18%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', background: '#1e3a5f' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Chanderi & Maheshwari Weaves (Madhya Pradesh)</span>
                <span style={{ fontWeight: 600 }}>12%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '12%', height: '100%', background: '#64748b' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#0f172a', margin: '0 0 16px' }}>
            Operational Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Curated Ateliers Active</span>
              <strong style={{ color: '#0f172a' }}>{stats?.totalStores || 0} Ateliers</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Published Craft Products</span>
              <strong style={{ color: '#0f172a' }}>{stats?.totalProducts || 0} Listings</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Total Patrons Registered</span>
              <strong style={{ color: '#0f172a' }}>{stats?.totalCustomers || 0} Patrons</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Average Order Basket</span>
              <strong style={{ color: '#0f172a' }}>
                {formatCurrency(stats?.totalOrders ? Math.round(gmv / stats.totalOrders) : 0)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

