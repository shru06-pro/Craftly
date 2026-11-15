// src/pages/store-owner/StoreProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Store, MapPin, Clock, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';

export default function StoreProfilePage() {
  const { token, apiBase } = useAuth();
  const { activeStore, reloadStores } = useActiveStore();

  const [formData, setFormData] = useState({
    studioName: '',
    name: '',
    craft: '',
    bio: '',
    leadTime: '',
    city: '',
    state: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (activeStore) {
      setFormData({
        studioName: activeStore.studioName || '',
        name: activeStore.name || '',
        craft: activeStore.craft || '',
        bio: activeStore.bio || '',
        leadTime: activeStore.leadTime || '7-10 business days',
        city: activeStore.city || '',
        state: activeStore.state || '',
        contactEmail: activeStore.contactEmail || '',
        contactPhone: activeStore.contactPhone || '',
      });
    }
  }, [activeStore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${apiBase}/stores/my/stores/${activeStore.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update atelier profile');
      }

      setMessage({ type: 'success', text: 'Atelier profile updated successfully!' });
      await reloadStores();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!activeStore) return <p>Please select an atelier.</p>;

  return (
    <div>
      <h1 className="store-header-title">Atelier Heritage & Studio Profile</h1>
      <p className="store-header-subtitle">
        Manage public atelier information, artisan provenance, and dispatch expectations shown to patrons.
      </p>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '14px',
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Studio / Atelier Brand Name *
            </label>
            <input
              type="text"
              required
              value={formData.studioName}
              onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Master Artisan / Founder Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Craft Heritage Specialization *
            </label>
            <input
              type="text"
              required
              value={formData.craft}
              onChange={(e) => setFormData({ ...formData, craft: e.target.value })}
              placeholder="e.g. Chikankari Hand Embroidery"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Standard Handloom Lead Time
            </label>
            <input
              type="text"
              value={formData.leadTime}
              onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              placeholder="e.g. 7-10 business days"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              State *
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
            Artisan Biography & Workshop Provenance
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Share the generational story, wooden block carvings, natural dye preparations, and community of artisans who craft each piece..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-sand-200)', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '14px' }}
        >
          {saving ? 'Saving changes...' : 'Save Atelier Profile'}
        </button>
      </form>
    </div>
  );
}

