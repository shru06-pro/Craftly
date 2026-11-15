// src/pages/admin/AdminCustomersPage.jsx
import React, { useEffect, useState } from 'react';
import { Users, UserX, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCustomersPage() {
  const { token, apiBase } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setCustomers(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [token, apiBase]);

  const handleToggleCustomer = async (userId, currentActive) => {
    const action = currentActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;

    try {
      const res = await fetch(`${apiBase}/admin/customers/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        loadCustomers();
      } else {
        const json = await res.json();
        alert(json.message || 'Status update failed');
      }
    } catch (e) {
      alert('Error changing user status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Patron & User Account Directory</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Manage registered patrons, artisan store owner profiles, and permissions.
          </p>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>User / Patron</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Mobile Phone</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Platform Role</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Orders Placed</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name || 'Patron'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{c.email || 'Phone authenticated'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {c.phone || '—'}
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
                          c.role === 'SUPER_ADMIN'
                            ? '#fef3c7'
                            : c.role === 'ADMIN'
                            ? '#e0e7ff'
                            : c.role === 'STORE_OWNER'
                            ? '#fce7f3'
                            : '#f1f5f9',
                        color:
                          c.role === 'SUPER_ADMIN'
                            ? '#92400e'
                            : c.role === 'ADMIN'
                            ? '#3730a3'
                            : c.role === 'STORE_OWNER'
                            ? '#9d174d'
                            : '#475569',
                      }}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {c._count?.orders ?? (c.orders?.length || 0)} orders
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: c.isActive ? '#166534' : '#b91c1c' }}>
                      {c.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {c.role !== 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleToggleCustomer(c.id, c.isActive)}
                        style={{
                          background: c.isActive ? '#fff1f2' : '#f0fdf4',
                          color: c.isActive ? '#be123c' : '#15803d',
                          border: `1px solid ${c.isActive ? '#fecdd3' : '#bbf7d0'}`,
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
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

