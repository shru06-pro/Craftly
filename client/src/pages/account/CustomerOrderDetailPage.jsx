// src/pages/account/CustomerOrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Store,
  AlertCircle,
  Scissors
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerOrderDetailPage() {
  const { orderNumber } = useParams();
  const { token, apiBase } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/orders/${orderNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setOrder(json.data);
        } else {
          setError(json.message || 'Failed to locate order');
        }
      } catch (err) {
        setError('Network error retrieving order details');
      } finally {
        setLoading(false);
      }
    }

    if (token && orderNumber) {
      fetchOrder();
    }
  }, [token, orderNumber, apiBase]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-sand-600)' }}>
        <p>Loading tracking milestones and atelier records...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={40} style={{ color: '#b91c1c', marginBottom: '12px' }} />
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)' }}>Order Not Found</h3>
        <p style={{ color: 'var(--color-sand-600)', marginBottom: '20px' }}>{error || 'Could not locate reference number.'}</p>
        <Link to="/account/orders" className="btn btn-secondary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const milestones = [
    { title: 'Order Commissioned', desc: 'Received & routed to ateliers', done: true },
    {
      title: 'Artisan Confirmation',
      desc: 'Master weaver accepted commission',
      done: ['CONFIRMED', 'ACCEPTED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
    },
    {
      title: 'Handloom & Tailoring',
      desc: 'Bespoke tailoring on frame',
      done: ['IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
    },
    {
      title: 'Dispatched with Tracking',
      desc: 'Handover to courier partner',
      done: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus),
    },
    {
      title: 'Delivered',
      desc: 'Safely delivered to customer',
      done: order.orderStatus === 'DELIVERED',
    },
  ];

  return (
    <div>
      <Link
        to="/account/orders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-terracotta)',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to All Orders</span>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--color-sand-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Commission Reference
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--color-espresso)', margin: '2px 0 0' }}>
            {order.orderNumber}
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--color-sand-600)' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-sand-500)', display: 'block', textTransform: 'uppercase' }}>Status</span>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: '#eef7ee',
              color: '#2b7430',
              marginTop: '4px',
            }}
          >
            {order.orderStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div
        style={{
          padding: '24px',
          background: 'var(--color-sand-50)',
          borderRadius: '8px',
          border: '1px solid var(--color-sand-200)',
          marginBottom: '32px',
        }}
      >
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-espresso)', margin: '0 0 16px' }}>
          Artisan Production & Delivery Timeline
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {milestones.map((step, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: step.done ? 'var(--color-terracotta)' : 'var(--color-sand-200)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: step.done ? 'var(--color-espresso)' : 'var(--color-sand-500)' }}>
                  {step.title}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-sand-600)', margin: 0, paddingLeft: '32px' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Store Sub-Orders & Items */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-espresso)', marginBottom: '16px' }}>
          Consolidated Artisan Dispatches ({order.storeOrders?.length || 1} Atelier{order.storeOrders?.length > 1 ? 's' : ''})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(order.storeOrders && order.storeOrders.length > 0 ? order.storeOrders : [{ items: order.items }]).map((so, idx) => (
            <div
              key={so.id || idx}
              style={{
                border: '1px solid var(--color-sand-200)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {so.artisan && (
                <div
                  style={{
                    padding: '12px 20px',
                    background: '#fcf8f2',
                    borderBottom: '1px solid var(--color-sand-200)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Store size={16} color="var(--color-terracotta)" />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-espresso)' }}>
                      {so.artisan.studioName || so.artisan.name}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-sand-500)' }}>({so.storeOrderNumber})</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-terracotta)' }}>
                    Sub-status: {so.status}
                  </span>
                </div>
              )}

              <div style={{ padding: '16px 20px' }}>
                {(so.items || []).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--color-sand-100)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-espresso)', fontSize: '14px' }}>
                        {item.productTitle || item.product?.title || 'Handcrafted Artisan Item'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-sand-600)', marginTop: '2px' }}>
                        Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.variantName && <span> • Variant: {item.variantName}</span>}
                      </div>

                      {item.customizationDetails && (
                        <div
                          style={{
                            marginTop: '6px',
                            padding: '6px 10px',
                            background: 'var(--color-sand-50)',
                            borderRadius: '4px',
                            border: '1px dashed var(--color-sand-300)',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--color-espresso)',
                          }}
                        >
                          <Scissors size={13} color="var(--color-terracotta)" />
                          <span>
                            Tailored Spec: {JSON.stringify(item.customizationDetails).replace(/[{}\"]/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ fontWeight: 700, color: 'var(--color-espresso)', fontSize: '15px' }}>
                      {formatCurrency(item.subtotal || item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{ padding: '20px', border: '1px solid var(--color-sand-200)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MapPin size={18} color="var(--color-terracotta)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-espresso)', margin: 0 }}>
              Delivery Address
            </h4>
          </div>
          {order.shippingAddress ? (
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-sand-700)' }}>
              <strong>{order.shippingAddress.fullName || order.shippingAddress.name}</strong>
              <br />
              {order.shippingAddress.street || order.shippingAddress.addressLine1}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              <br />
              Phone: {order.shippingAddress.phone}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-sand-500)' }}>Standard artisan packaging</p>
          )}
        </div>

        <div style={{ padding: '20px', border: '1px solid var(--color-sand-200)', borderRadius: '8px', background: 'var(--color-sand-50)' }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-espresso)', margin: '0 0 12px' }}>
            Payment Summary
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-sand-600)' }}>Item Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-sand-600)' }}>Insured Handloom Freight</span>
              <span style={{ color: '#2b7430', fontWeight: 600 }}>Complimentary</span>
            </div>
            <div style={{ borderTop: '1px solid var(--color-sand-200)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--color-terracotta)' }}>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

