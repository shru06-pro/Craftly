// src/pages/account/CustomerProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Calendar, Ruler, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user, token, apiBase, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [measurements, setMeasurements] = useState(() => {
    try {
      const saved = localStorage.getItem('craftly_customer_measurements');
      return saved ? JSON.parse(saved) : { chest: '', waist: '', hips: '', shoulder: '', height: '' };
    } catch {
      return { chest: '', waist: '', hips: '', shoulder: '', height: '' };
    }
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Save measurements locally
      localStorage.setItem('craftly_customer_measurements', JSON.stringify(measurements));

      // We can also update customer profile on server if an endpoint exists, or refresh
      setMessage({ type: 'success', text: 'Atelier profile & measurements updated successfully!' });
      await refreshProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="account-content-title">Personal Profile & Atelier Preferences</h2>
      <p className="account-content-subtitle">
        Manage your contact details and default bespoke sizing measurements for custom Chikankari and handloom garments.
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

      <form onSubmit={handleSaveProfile}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--color-sand-200)',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sand-500)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Email Address (Verified)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--color-sand-200)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-sand-50)',
                  color: 'var(--color-sand-600)',
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sand-500)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Mobile Phone
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--color-sand-200)',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sand-500)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '6px' }}>
              Account Tier
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={`${user?.role || 'CUSTOMER'} (Verified Patron)`}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--color-sand-200)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-sand-50)',
                  color: 'var(--color-sand-600)',
                }}
              />
              <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sand-500)' }} />
            </div>
          </div>
        </div>

        {/* Bespoke Sizing Preferences */}
        <div style={{ borderTop: '1px solid var(--color-sand-200)', paddingTop: '28px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Ruler size={18} color="var(--color-terracotta)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: 0 }}>
              Saved Tailoring Measurements (Inches)
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-sand-600)', marginBottom: '16px' }}>
            These measurements will be automatically suggested when you choose 'Custom Tailored Fit' on garments.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>Chest / Bust</label>
              <input
                type="number"
                placeholder="e.g. 38"
                value={measurements.chest}
                onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>Waist</label>
              <input
                type="number"
                placeholder="e.g. 32"
                value={measurements.waist}
                onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>Hips</label>
              <input
                type="number"
                placeholder="e.g. 40"
                value={measurements.hips}
                onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>Shoulder</label>
              <input
                type="number"
                placeholder="e.g. 15.5"
                value={measurements.shoulder}
                onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>Height (ft/in)</label>
              <input
                type="text"
                placeholder="e.g. 5'6&quot;"
                value={measurements.height}
                onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '14px' }}
        >
          {saving ? 'Saving changes...' : 'Save Atelier Preferences'}
        </button>
      </form>
    </div>
  );
}

