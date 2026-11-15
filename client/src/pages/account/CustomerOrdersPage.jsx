// src/pages/account/CustomerOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, Truck, Clock, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerOrdersPage() {
  const { token, apiBase } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setOrders(json.data || []);
        } else {
          setError(json.message || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('Network error while retrieving atelier orders');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchOrders();
    }
  }, [token, apiBase]);

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
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
        }}
      >
        {status?.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-sand-600)' }}>
        <p>Loading your atelier orders & commission history...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="account-content-title" style={{ margin: 0 }}>My Atelier Orders</h2>
          <p className="account-content-subtitle" style={{ margin: '4px 0 0' }}>
            Track multi-vendor artisan commissions and delivery milestones.
          </p>
        </div>
        <Link to="/shop" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
          Browse Marketplace
        </Link>
      </div>

      {error && (
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-sand-50)', borderRadius: '8px', border: '1px dashed var(--color-sand-300)' }}>
          <ShoppingBag size={48} style={{ color: 'var(--color-sand-400)', marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-espresso)', marginBottom: '8px' }}>
            No Orders Placed Yet
          </h3>
          <p style={{ color: 'var(--color-sand-600)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
            When you purchase handmade creations from local Indian ateliers, their provenance and tailoring progress will appear here.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Discover Authentic Indian Crafts
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                style={{
                  border: '1px solid var(--color-sand-200)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#ffffff',
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--color-sand-50)',
                    borderBottom: '1px solid var(--color-sand-200)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--color-sand-500)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Order Placed</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>{dateStr}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-sand-500)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Total Amount</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-terracotta)' }}>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-sand-500)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Payment</span>
                      <span style={{ fontWeight: 500, color: 'var(--color-espresso)' }}>{order.paymentMethod} ({order.paymentStatus})</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-sand-500)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Reference #</span>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{order.orderNumber}</span>
                    </div>
                  </div>

                  <div>
                    <Link
                      to={`/account/orders/${order.orderNumber}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>Track Order</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Sub-Orders by Artisan Atelier */}
                <div style={{ padding: '20px' }}>
                  {order.storeOrders && order.storeOrders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {order.storeOrders.map((so) => (
                        <div
                          key={so.id}
                          style={{
                            padding: '14px 18px',
                            background: '#faf8f5',
                            border: '1px solid var(--color-sand-200)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--color-sand-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-terracotta)',
                              }}
                            >
                              <Store size={18} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-espresso)', fontSize: '14px' }}>
                                  {so.artisan?.studioName || so.artisan?.name || 'Local Artisan Atelier'}
                                </span>
                                {so.artisan?.state && (
                                  <span style={{ fontSize: '11px', color: 'var(--color-sand-500)' }}>({so.artisan.state})</span>
                                )}
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--color-sand-600)' }}>
                                Sub-order: <code style={{ fontSize: '11px' }}>{so.storeOrderNumber}</code> • {so.items?.length || 0} item(s)
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-espresso)' }}>
                              {formatCurrency(so.subtotal)}
                            </span>
                            {getStatusBadge(so.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Package size={16} color="var(--color-terracotta)" />
                      <span style={{ fontSize: '14px', color: 'var(--color-espresso)' }}>
                        Items being prepared for dispatch.
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

