// src/pages/store-owner/StoreOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { ShoppingBag, Check, X, Truck, Package, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';
import { formatCurrency } from '../../utils/formatCurrency';

export default function StoreOrdersPage() {
  const { token, apiBase } = useAuth();
  const { activeStore } = useActiveStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setOrders(json.data || []);
      } else {
        setError(json.message || 'Failed to load store orders');
      }
    } catch (err) {
      setError('Network error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeStore, token, apiBase]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadOrders();
      } else {
        const json = await res.json();
        alert(json.message || 'Status update failed');
      }
    } catch (e) {
      alert('Network error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please specify why this order cannot be fulfilled.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/orders/${rejectingOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'REJECTED', reason: rejectionReason }),
      });
      if (res.ok) {
        setRejectingOrder(null);
        setRejectionReason('');
        loadOrders();
      } else {
        const json = await res.json();
        alert(json.message || 'Rejection failed');
      }
    } catch (e) {
      alert('Network error updating order');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    let bg = '#f3f4f6';
    let color = '#374151';

    if (s === 'PENDING') {
      bg = '#fffbeb';
      color = '#b45309';
    } else if (s === 'CONFIRMED' || s === 'ACCEPTED') {
      bg = '#eff6ff';
      color = '#1d4ed8';
    } else if (s === 'IN_PRODUCTION') {
      bg = '#f5f3ff';
      color = '#6d28d9';
    } else if (s === 'READY_TO_SHIP') {
      bg = '#f0fdf4';
      color = '#15803d';
    } else if (s === 'SHIPPED') {
      bg = '#ecfdf5';
      color = '#047857';
    } else if (s === 'DELIVERED') {
      bg = '#eef7ee';
      color = '#2b7430';
    } else if (s === 'CANCELLED' || s === 'REJECTED') {
      bg = '#fef2f2';
      color = '#b91c1c';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
          textTransform: 'uppercase',
        }}
      >
        {status?.replace('_', ' ')}
      </span>
    );
  };

  if (!activeStore) return <p>Please select an atelier.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="store-header-title">Atelier Commission Orders</h1>
          <p className="store-header-subtitle" style={{ margin: 0 }}>
            Process incoming orders, track loom tailoring, and manage dispatch milestones for {activeStore.studioName || activeStore.name}.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-sand-200)' }}>
          <ShoppingBag size={48} style={{ color: 'var(--color-sand-400)', marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', marginBottom: '8px' }}>
            No Incoming Orders Yet
          </h3>
          <p style={{ color: 'var(--color-sand-600)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>
            When patrons purchase your handcrafted textiles or garments, commissions will appear here for loom scheduling and packaging.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((so) => {
            const dateStr = new Date(so.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={so.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-sand-200)',
                  borderRadius: '8px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-sand-500)', textTransform: 'uppercase' }}>Sub-Order</span>
                      <code style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-espresso)' }}>{so.storeOrderNumber}</code>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-sand-600)', marginTop: '2px' }}>
                      Commissioned on {dateStr} • Parent Order: <span style={{ fontFamily: 'monospace' }}>{so.order?.orderNumber}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {getStatusBadge(so.status)}
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: '4px' }}>
                      {formatCurrency(so.subtotal)}
                    </div>
                  </div>
                </div>

                {/* Items in this sub-order */}
                <div style={{ background: 'var(--color-sand-50)', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                  {(so.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: i < so.items.length - 1 ? '1px dashed var(--color-sand-200)' : 'none' }}>
                      <div>
                        <strong>{item.productTitle || item.product?.title || 'Handcrafted Textile'}</strong>
                        <span style={{ color: 'var(--color-sand-600)' }}> × {item.quantity}</span>
                        {item.customizationDetails && (
                          <div style={{ fontSize: '11px', color: 'var(--color-terracotta)' }}>
                            Custom Fit: {JSON.stringify(item.customizationDetails)}
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal || item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Status action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-sand-100)', paddingTop: '16px' }}>
                  {so.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(so.id, 'ACCEPTED')}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Check size={14} />
                        <span>Accept Commission</span>
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => setRejectingOrder(so)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 14px', color: '#b91c1c', borderColor: '#fecaca' }}
                      >
                        <X size={14} />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {so.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(so.id, 'IN_PRODUCTION')}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      Mark In Loom Production
                    </button>
                  )}

                  {so.status === 'IN_PRODUCTION' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(so.id, 'READY_TO_SHIP')}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      Mark Ready for Dispatch
                    </button>
                  )}

                  {so.status === 'READY_TO_SHIP' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(so.id, 'SHIPPED')}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Truck size={14} />
                      <span>Dispatch Shipment</span>
                    </button>
                  )}

                  {so.status === 'SHIPPED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(so.id, 'DELIVERED')}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', maxWidth: '440px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: '0 0 8px' }}>
              Decline Artisan Commission
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-sand-600)', marginBottom: '16px' }}>
              Please state why {rejectingOrder.storeOrderNumber} cannot be accepted (e.g. out of fabric stock, weaver capacity, unable to meet deadline):
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for declining..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
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
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

