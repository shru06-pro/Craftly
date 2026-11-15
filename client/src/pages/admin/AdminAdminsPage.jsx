// src/pages/admin/AdminAdminsPage.jsx
import React, { useEffect, useState } from 'react';
import { Shield, UserPlus, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminAdminsPage() {
  const { token, apiBase, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STORE_APPROVAL_ADMIN',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/admin/administrators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setAdmins(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdmins();
    }
  }, [isSuperAdmin, token, apiBase]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/admin/administrators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAdmin),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to create administrator');
      }

      setShowAddModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'STORE_APPROVAL_ADMIN' });
      loadAdmins();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAdminStatus = async (adminId, currentActive) => {
    const action = currentActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this administrator?`)) return;

    try {
      const res = await fetch(`${apiBase}/admin/administrators/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        loadAdmins();
      } else {
        const json = await res.json();
        alert(json.message || 'Action failed');
      }
    } catch (e) {
      alert('Error changing admin status');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Lock size={48} style={{ color: '#b91c1c', marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#0f172a' }}>Super Administrator Privilege Required</h2>
        <p style={{ color: '#64748b' }}>Only the designated Super Admin can provision or manage platform administrators.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Platform Administrators & RBAC</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Provision and govern scoped administrative roles (Store Approval, Product Moderation, Order Monitoring, Customer Support).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={16} />
          <span>Provision New Admin</span>
        </button>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Administrator</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Role</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Permissions Scope</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((adm) => {
              const isSuper = adm.role === 'SUPER_ADMIN';
              const adminProfileRole = adm.adminProfile?.role || (isSuper ? 'SUPER_ADMIN' : 'REGULAR_ADMIN');

              return (
                <tr key={adm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{adm.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{adm.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isSuper ? '#fef3c7' : '#e0e7ff',
                        color: isSuper ? '#92400e' : '#3730a3',
                      }}
                    >
                      {adminProfileRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                    {isSuper ? 'Full System Authority (Bypass All)' : adm.adminProfile?.permissions?.join(', ') || 'Standard Scope'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: adm.isActive ? '#166534' : '#b91c1c' }}>
                      {adm.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {!isSuper ? (
                      <button
                        type="button"
                        onClick={() => handleToggleAdminStatus(adm.id, adm.isActive)}
                        style={{
                          background: adm.isActive ? '#fff1f2' : '#f0fdf4',
                          color: adm.isActive ? '#be123c' : '#15803d',
                          border: `1px solid ${adm.isActive ? '#fecdd3' : '#bbf7d0'}`,
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {adm.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Protected</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Provision Admin Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', maxWidth: '500px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#0f172a', margin: '0 0 8px' }}>
              Provision Platform Administrator
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Create an administrative account with scoped permissions according to platform governance guidelines.
            </p>

            <form onSubmit={handleCreateAdmin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="e.g. Anandita Sen"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="e.g. anandita@craftly.in"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Temporary Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Administrative Role *</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="STORE_APPROVAL_ADMIN">Store Approval Admin (Review & verify artisan studios)</option>
                  <option value="PRODUCT_ADMIN">Product Admin (Review, moderate & audit listings)</option>
                  <option value="ORDER_ADMIN">Order Admin (Monitor multi-vendor dispatches & disputes)</option>
                  <option value="CUSTOMER_SUPPORT_ADMIN">Customer Support Admin (Patron assistance & accounts)</option>
                  <option value="ANALYTICS_ADMIN">Analytics Admin (Financials, GMV & reporting)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  {submitting ? 'Creating...' : 'Provision Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

