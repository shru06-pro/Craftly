// src/pages/admin/AdminOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, ChevronRight, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminOrdersPage() {
  const { token, apiBase } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setOrders(json.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token, apiBase]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.orderStatus === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Marketplace Order Monitoring</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Track multi-vendor parent commissions and independent atelier sub-orders.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                background: filter === f ? '#0f172a' : '#ffffff',
                color: filter === f ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order Number</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer Patron</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Value</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Atelier Sub-Orders</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Global Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No orders recorded under '{filter}'.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {o.orderNumber}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.user?.name || 'Guest Patron'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{o.user?.email || o.user?.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                    {formatCurrency(o.totalAmount)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>
                      {o.paymentMethod} ({o.paymentStatus})
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(o.storeOrders || []).map((so) => (
                        <div key={so.id} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>{so.artisan?.studioName || 'Atelier'}:</span>
                          <span style={{ color: '#64748b' }}>{so.status}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          o.orderStatus === 'DELIVERED'
                            ? '#eef7ee'
                            : o.orderStatus === 'CANCELLED'
                            ? '#fef2f2'
                            : '#fffbeb',
                        color:
                          o.orderStatus === 'DELIVERED'
                            ? '#2b7430'
                            : o.orderStatus === 'CANCELLED'
                            ? '#b91c1c'
                            : '#b45309',
                      }}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

