// src/pages/admin/AdminStoresPage.jsx
import React, { useEffect, useState } from 'react';
import { Store, ShieldAlert, CheckCircle, Ban, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminStoresPage() {
  const { token, apiBase } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setStores(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [token, apiBase]);

  const handleToggleStatus = async (storeId, currentStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    const actionLabel = newStatus === 'SUSPENDED' ? 'suspend' : 'reinstate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this atelier?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/stores/${storeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadStores();
      } else {
        const json = await res.json();
        alert(json.message || 'Status update failed');
      }
    } catch (e) {
      alert('Error updating store status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Marketplace Artisan Stores</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Oversee active, pending, and suspended craft ateliers across India.
          </p>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Atelier Studio</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Craft / Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Products</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No stores recorded on platform.
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.studioName || s.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Founder: {s.name}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-terracotta)', fontWeight: 500 }}>
                    {s.craft}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {s.city ? `${s.city}, ` : ''}{s.state || 'India'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {s._count?.products ?? (s.products?.length || 0)} items
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
                          s.status === 'APPROVED' ? '#eef7ee' : s.status === 'SUSPENDED' ? '#fee2e2' : '#fffbeb',
                        color:
                          s.status === 'APPROVED' ? '#2b7430' : s.status === 'SUSPENDED' ? '#991b1b' : '#b45309',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      {s.status === 'APPROVED' && (
                        <Link
                          to={`/stores/${s.slug}`}
                          target="_blank"
                          style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}
                          title="View public store"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      {s.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Suspend
                        </button>
                      )}

                      {s.status === 'SUSPENDED' && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          style={{
                            background: '#eef7ee',
                            color: '#2b7430',
                            border: '1px solid #bbf7d0',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Reinstate
                        </button>
                      )}
                    </div>
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

