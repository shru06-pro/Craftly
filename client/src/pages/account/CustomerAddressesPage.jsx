// src/pages/account/CustomerAddressesPage.jsx
import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CustomerAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('craftly_saved_addresses');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'addr-default',
              type: 'Home',
              fullName: user?.name || 'Patron',
              phone: user?.phone || '+91 98765 43210',
              street: '42, Silk Weavers Colony, Hazratganj',
              city: 'Lucknow',
              state: 'Uttar Pradesh',
              pincode: '226001',
              isDefault: true,
            },
          ];
    } catch {
      return [];
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const saveAddresses = (updated) => {
    setAddresses(updated);
    localStorage.setItem('craftly_saved_addresses', JSON.stringify(updated));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city || !newAddr.pincode) {
      alert('Please fill in all mandatory address fields.');
      return;
    }

    const created = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };

    let updated = [...addresses];
    if (created.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(created);
    saveAddresses(updated);
    setShowAddForm(false);
    setNewAddr({
      type: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const handleDelete = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="account-content-title" style={{ margin: 0 }}>Saved Delivery Addresses</h2>
          <p className="account-content-subtitle" style={{ margin: '4px 0 0' }}>
            Manage shipping destinations for expedited artisan delivery across India.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddAddress}
          style={{
            padding: '24px',
            background: 'var(--color-sand-50)',
            borderRadius: '8px',
            border: '1px solid var(--color-sand-300)',
            marginBottom: '28px',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: '0 0 16px' }}>
            New Delivery Address
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
                Address Type
              </label>
              <select
                value={newAddr.type}
                onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px', background: '#fff' }}
              >
                <option value="Home">Home</option>
                <option value="Work">Office / Work</option>
                <option value="Studio">Studio / Atelier</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
              Street Address, House/Flat No, Landmark *
            </label>
            <input
              type="text"
              required
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
                City *
              </label>
              <input
                type="text"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
                State *
              </label>
              <input
                type="text"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
                PIN Code *
              </label>
              <input
                type="text"
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="isDefaultAddr"
              checked={newAddr.isDefault}
              onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
            />
            <label htmlFor="isDefaultAddr" style={{ fontSize: '13px', color: 'var(--color-espresso)', cursor: 'pointer' }}>
              Set as default shipping address
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
            Save Address
          </button>
        </form>
      )}

      {/* Addresses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {addresses.map((addr) => (
          <div
            key={addr.id}
            style={{
              padding: '20px',
              border: `1px solid ${addr.isDefault ? 'var(--color-terracotta)' : 'var(--color-sand-200)'}`,
              borderRadius: '8px',
              position: 'relative',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-espresso)',
                  background: 'var(--color-sand-100)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                {addr.type === 'Work' ? <Briefcase size={12} /> : <Home size={12} />}
                <span>{addr.type}</span>
              </span>

              {addr.isDefault ? (
                <span style={{ fontSize: '11px', color: 'var(--color-terracotta)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} />
                  DEFAULT
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-sand-600)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Make Default
                </button>
              )}
            </div>

            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '4px' }}>
              {addr.fullName}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-sand-700)', lineHeight: '1.5', marginBottom: '8px' }}>
              {addr.street}
              <br />
              {addr.city}, {addr.state} - {addr.pincode}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-sand-500)', marginBottom: '16px' }}>
              Phone: {addr.phone}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-sand-100)', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

