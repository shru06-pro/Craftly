// src/pages/admin/AdminStoreApplicationsPage.jsx
import React, { useEffect, useState } from 'react';
import { FileCheck, Check, X, Clock, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminStoreApplicationsPage() {
  const { token, apiBase } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL'
        ? `${apiBase}/admin/store-applications`
        : `${apiBase}/admin/store-applications?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) {
        setApplications(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [filter, token, apiBase]);

  const handleApprove = async (appId) => {
    if (!window.confirm('Approve this artisan atelier? The store will become active immediately and the owner can publish products.')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/store-applications/${appId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadApplications();
      } else {
        const json = await res.json();
        alert(json.message || 'Approval failed');
      }
    } catch (e) {
      alert('Error approving application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please specify rejection reason for the applicant.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/store-applications/${rejectingApp.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (res.ok) {
        setRejectingApp(null);
        setRejectionReason('');
        loadApplications();
      } else {
        const json = await res.json();
        alert(json.message || 'Rejection failed');
      }
    } catch (e) {
      alert('Error rejecting application');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Store Registration Applications</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Curate artisan workshops, review master craft credentials, and authorize marketplace storefronts.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
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

      {/* Applications Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Atelier & Craft</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Artisan Owner</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Applied On</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No applications found matching '{filter}'.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.studioName || app.storeName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-terracotta)', fontWeight: 500 }}>{app.craft}</div>
                    {app.description && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', maxWidth: '300px' }}>
                        {app.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.owner?.name || app.ownerName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{app.owner?.email || app.ownerEmail}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{app.owner?.phone || app.ownerPhone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {app.city ? `${app.city}, ` : ''}{app.state || 'India'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          app.status === 'APPROVED' ? '#eef7ee' : app.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                        color:
                          app.status === 'APPROVED' ? '#2b7430' : app.status === 'PENDING' ? '#b45309' : '#b91c1c',
                      }}
                    >
                      {app.status}
                    </span>
                    {app.rejectionReason && (
                      <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                        Reason: {app.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {app.status === 'PENDING' && (
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleApprove(app.id)}
                          style={{
                            background: '#166534',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => setRejectingApp(app)}
                          style={{
                            background: '#ffffff',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={12} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectingApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', maxWidth: '440px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#0f172a', margin: '0 0 8px' }}>
              Reject Atelier Application
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Please provide constructive feedback so {rejectingApp.studioName || rejectingApp.storeName} can correct their application:
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete artisan lineage documentation, please attach weaving guild certificate..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectingApp(null)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px', background: '#b91c1c', borderColor: '#b91c1c' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

