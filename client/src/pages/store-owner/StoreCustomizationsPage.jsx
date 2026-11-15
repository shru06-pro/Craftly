// src/pages/store-owner/StoreCustomizationsPage.jsx
import React, { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, IndianRupee, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';
import { formatCurrency } from '../../utils/formatCurrency';

export default function StoreCustomizationsPage() {
  const { token, apiBase } = useAuth();
  const { activeStore } = useActiveStore();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [respondingReq, setRespondingReq] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [artisanNotes, setArtisanNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState('ACCEPTED');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/customization/store/${activeStore.id}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setRequests(json.data || []);
      } else {
        setError(json.message || 'Failed to load customization requests');
      }
    } catch (e) {
      setError('Network error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeStore, token, apiBase]);

  const handleOpenResponse = (req, status) => {
    setRespondingReq(req);
    setTargetStatus(status);
    setQuotePrice(req.quotedPrice ? String(req.quotedPrice) : '');
    setArtisanNotes(req.artisanNotes || '');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        status: targetStatus,
        artisanNotes: artisanNotes.trim() || undefined,
        quotedPrice: quotePrice ? parseFloat(quotePrice) : undefined,
      };

      const res = await fetch(`${apiBase}/customization/requests/${respondingReq.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setRespondingReq(null);
        loadRequests();
      } else {
        const json = await res.json();
        alert(json.message || 'Failed to submit response');
      }
    } catch (err) {
      alert('Network error submitting quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeStore) return <p>Please select an atelier.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="store-header-title">Bespoke Customization Inquiries</h1>
          <p className="store-header-subtitle" style={{ margin: 0 }}>
            Review customer design briefs, examine reference images, quote custom artisan pricing, and confirm bespoke commissions.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-sand-200)' }}>
          <Sparkles size={48} style={{ color: 'var(--color-sand-400)', marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', marginBottom: '8px' }}>
            No Custom Inquiries Pending
          </h3>
          <p style={{ color: 'var(--color-sand-600)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>
            Patrons can submit special tailoring, custom embroidery, or size alterations on your customizable products.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--color-sand-200)',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-sand-500)', textTransform: 'uppercase' }}>Inquiry Reference #{req.id.slice(0, 8)}</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-espresso)', margin: '2px 0 0' }}>
                    {req.product ? req.product.title : 'Bespoke Studio Commission'}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-sand-600)', marginTop: '2px' }}>
                    Patron: <strong>{req.customer?.name || 'Craft Patron'}</strong> ({req.customer?.email || req.customer?.phone})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#fef3c7',
                      color: '#b45309',
                      textTransform: 'uppercase',
                    }}
                  >
                    {req.status}
                  </span>
                  {req.quotedPrice && (
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: '4px' }}>
                      Quoted: {formatCurrency(req.quotedPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Requirement Box */}
              <div style={{ background: 'var(--color-sand-50)', padding: '14px', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                <strong>Patron Design Brief:</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--color-sand-700)' }}>{req.requirements}</p>
              </div>

              {/* Reference Images */}
              {req.referenceImages && req.referenceImages.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sand-600)', display: 'block', marginBottom: '6px' }}>
                    Patron Uploaded References:
                  </span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {req.referenceImages.map((img, i) => (
                      <a
                        key={i}
                        href={img.startsWith('http') ? img : `http://localhost:4000${img}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-sand-300)' }}
                      >
                        <img
                          src={img.startsWith('http') ? img : `http://localhost:4000${img}`}
                          alt="Reference"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Artisan Note */}
              {req.artisanNotes && (
                <div style={{ fontSize: '12px', color: '#166534', background: '#f0fdf4', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px' }}>
                  <strong>Your Stated Note:</strong> {req.artisanNotes}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-sand-100)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenResponse(req, 'ACCEPTED')}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Accept & Quote Price
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenResponse(req, 'REJECTED')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px', color: '#b91c1c' }}
                >
                  Decline Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {respondingReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 12px' }}>
              {targetStatus === 'ACCEPTED' ? 'Accept Custom Commission & Provide Quote' : 'Decline Custom Inquiry'}
            </h3>

            <form onSubmit={handleSubmitResponse}>
              {targetStatus === 'ACCEPTED' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Quoted Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="e.g. 4800"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Artisan Notes for Patron
                </label>
                <textarea
                  rows={3}
                  value={artisanNotes}
                  onChange={(e) => setArtisanNotes(e.target.value)}
                  placeholder="Estimated completion time, fabric shade availability, bespoke details..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRespondingReq(null)}
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
                  {submitting ? 'Submitting...' : 'Submit to Patron'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

