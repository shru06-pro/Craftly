// src/pages/account/CustomerCustomizationsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Store, Image, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerCustomizationsPage() {
  const { token, apiBase } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/customization/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setRequests(json.data || []);
        } else {
          setError(json.message || 'Failed to load customization requests');
        }
      } catch (err) {
        setError('Network error fetching customization inquiries');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchRequests();
    }
  }, [token, apiBase]);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    let bg = '#f3f4f6';
    let color = '#374151';

    if (s === 'SUBMITTED' || s === 'PENDING') {
      bg = '#fffbeb';
      color = '#b45309';
    } else if (s === 'UNDER_REVIEW') {
      bg = '#eff6ff';
      color = '#1d4ed8';
    } else if (s === 'ACCEPTED') {
      bg = '#eef7ee';
      color = '#2b7430';
    } else if (s === 'REJECTED') {
      bg = '#fef2f2';
      color = '#b91c1c';
    } else if (s === 'IN_PROGRESS') {
      bg = '#f5f3ff';
      color = '#6d28d9';
    } else if (s === 'COMPLETED') {
      bg = '#ecfdf5';
      color = '#047857';
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
        <p>Loading bespoke customization inquiries & artisan quotes...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="account-content-title" style={{ margin: 0 }}>Bespoke Customization Inquiries</h2>
          <p className="account-content-subtitle" style={{ margin: '4px 0 0' }}>
            Review status, artisan quotes, and bespoke design briefs submitted to Indian ateliers.
          </p>
        </div>
        <Link to="/shop" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
          Explore Products to Customize
        </Link>
      </div>

      {error && (
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-sand-50)', borderRadius: '8px', border: '1px dashed var(--color-sand-300)' }}>
          <Sparkles size={48} style={{ color: 'var(--color-sand-400)', marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-espresso)', marginBottom: '8px' }}>
            No Custom Inquiries Yet
          </h3>
          <p style={{ color: 'var(--color-sand-600)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px' }}>
            Looking for a custom Chikankari kurta with specific floral motifs, custom sizing, or bespoke block print colours? You can submit inquiries directly from any product page.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                border: '1px solid var(--color-sand-200)',
                borderRadius: '8px',
                padding: '24px',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-sand-500)', textTransform: 'uppercase' }}>Inquiry Reference</span>
                    <code style={{ fontSize: '12px', color: 'var(--color-terracotta)', fontWeight: 600 }}>{req.id.slice(0, 8)}</code>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: 0 }}>
                    {req.product ? req.product.title : 'General Atelier Inquiry'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-sand-600)', marginTop: '4px' }}>
                    <Store size={14} color="var(--color-terracotta)" />
                    <span>{req.store?.studioName || req.store?.name || 'Local Artisan Studio'}</span>
                    <span>•</span>
                    <span>Submitted on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {getStatusBadge(req.status)}
                  {req.quotedPrice && (
                    <div style={{ marginTop: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                      Quote: {formatCurrency(req.quotedPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Requirement Details */}
              <div style={{ padding: '16px', background: 'var(--color-sand-50)', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', lineHeight: '1.6', color: 'var(--color-espresso)' }}>
                <strong>Client Specification:</strong>
                <p style={{ margin: '6px 0 0', color: 'var(--color-sand-700)' }}>{req.requirements}</p>
              </div>

              {/* Artisan Note / Response if any */}
              {req.artisanNotes && (
                <div style={{ padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#166534' }}>
                  <strong>Artisan Atelier Note:</strong> {req.artisanNotes}
                </div>
              )}

              {/* Reference Photos */}
              {req.referenceImages && req.referenceImages.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sand-600)', display: 'block', marginBottom: '8px' }}>
                    Reference Photos Attached:
                  </span>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {req.referenceImages.map((imgUrl, i) => (
                      <a
                        key={i}
                        href={imgUrl.startsWith('http') ? imgUrl : `http://localhost:4000${imgUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '1px solid var(--color-sand-300)',
                          display: 'block',
                        }}
                      >
                        <img
                          src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:4000${imgUrl}`}
                          alt="Custom reference"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

