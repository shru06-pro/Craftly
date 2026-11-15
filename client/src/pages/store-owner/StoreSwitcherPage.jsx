// src/pages/store-owner/StoreSwitcherPage.jsx
import React, { useState } from 'react';
import { Store, Plus, CheckCircle, Clock, XCircle, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';

export default function StoreSwitcherPage() {
  const { token, apiBase } = useAuth();
  const { stores, activeStoreId, setActiveStoreId, reloadStores } = useActiveStore();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    studioName: '',
    craft: '',
    bio: '',
    leadTime: '7-10 business days',
    city: '',
    state: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${apiBase}/stores/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit store application');
      }

      setSuccess('Atelier application submitted successfully! It is now pending administrative verification.');
      await reloadStores();
      setShowApplyModal(false);
      setFormData({
        name: '',
        studioName: '',
        craft: '',
        bio: '',
        leadTime: '7-10 business days',
        city: '',
        state: '',
        contactEmail: '',
        contactPhone: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', background: '#eef7ee', color: '#2b7430', fontSize: '11px', fontWeight: 700 }}>
          <CheckCircle size={12} /> APPROVED
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', fontSize: '11px', fontWeight: 700 }}>
          <Clock size={12} /> PENDING APPROVAL
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: 700 }}>
          <XCircle size={12} /> APPLICATION REJECTED
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 700 }}>
        <AlertTriangle size={12} /> SUSPENDED
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="store-header-title">My Registered Ateliers & Studios</h1>
          <p className="store-header-subtitle" style={{ margin: 0 }}>
            Manage multiple artisan workshops and regional studios under your master artisan account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Register Another Atelier</span>
        </button>
      </div>

      {success && (
        <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Stores Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {stores.map((s) => {
          const isActive = s.id === activeStoreId;
          return (
            <div
              key={s.id}
              style={{
                background: '#ffffff',
                border: `2px solid ${isActive ? 'var(--color-terracotta)' : 'var(--color-sand-200)'}`,
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isActive ? '0 4px 12px rgba(184, 88, 52, 0.08)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-sand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-terracotta)' }}>
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: 0 }}>
                        {s.studioName || s.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--color-sand-600)' }}>{s.craft}</span>
                    </div>
                  </div>

                  {getStatusBadge(s.status)}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-sand-700)', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {s.bio || 'Indian craft atelier specializing in handloom and bespoke artisanal heritage.'}
                </p>

                <div style={{ fontSize: '12px', color: 'var(--color-sand-600)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
                  <div><strong>Location:</strong> {s.city ? `${s.city}, ` : ''}{s.state || 'India'}</div>
                  <div><strong>Lead Time:</strong> {s.leadTime || '7-10 business days'}</div>
                  {s.status === 'REJECTED' && s.rejectionReason && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#991b1b' }}>
                      <strong>Rejection Reason:</strong> {s.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--color-sand-100)', paddingTop: '16px' }}>
                {isActive ? (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} /> Active Dashboard Atelier
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveStoreId(s.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Switch to this Atelier
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Atelier Modal */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--color-espresso)', margin: 0 }}>
                Register New Artisan Atelier
              </h2>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-sand-600)' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-sand-600)', marginBottom: '24px' }}>
              Submit an independent store application. Each atelier is independently curated to guarantee craft authenticity and fair artisan wages.
            </p>

            <form onSubmit={handleApply}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Master Weaver / Artisan Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ustad Shamim Akhtar"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Studio / Atelier Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.studioName}
                    onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                    placeholder="e.g. Hazratganj Zardozi Guild"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Craft Specialization *</label>
                  <input
                    type="text"
                    required
                    value={formData.craft}
                    onChange={(e) => setFormData({ ...formData, craft: e.target.value })}
                    placeholder="e.g. Zardozi & Aari Embroidery"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Typical Lead Time</label>
                  <input
                    type="text"
                    value={formData.leadTime}
                    onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                    placeholder="e.g. 10-14 days"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Lucknow"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Artisan Bio & Atelier Heritage</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell patrons about your generational craft, natural dyes, loom techniques..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

