// src/pages/admin/AdminProductsPage.jsx
import React, { useEffect, useState } from 'react';
import { Package, Eye, EyeOff, Store, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminProductsPage() {
  const { token, apiBase } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token, apiBase]);

  const handleToggleProduct = async (productId, currentAvailable) => {
    try {
      const res = await fetch(`${apiBase}/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !currentAvailable }),
      });
      if (res.ok) {
        loadProducts();
      } else {
        const json = await res.json();
        alert(json.message || 'Status update failed');
      }
    } catch (e) {
      alert('Error updating product listing status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Marketplace Product Moderation</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Curate and moderate {products.length} artisan textiles and decor pieces across all approved ateliers.
          </p>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product Title</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Artisan Atelier</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Base Price</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Units</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Moderation</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No products catalogued.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const totalStock = p.variants?.reduce((acc, v) => acc + (v.stockQuantity || 0), 0) ?? 0;
                const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={img}
                          alt={p.title}
                          style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {p.isCustomizable ? 'Bespoke Sizing Enabled' : 'Standard Ready-to-Wear'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {p.artisan?.studioName || p.artisan?.name || 'Local Atelier'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {p.category?.name || 'General Craft'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {formatCurrency(p.basePrice)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      {totalStock} units
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: p.isAvailable ? '#eef7ee' : '#fef2f2',
                          color: p.isAvailable ? '#2b7430' : '#b91c1c',
                        }}
                      >
                        {p.isAvailable ? 'LIVE' : 'HIDDEN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(p.id, p.isAvailable)}
                        style={{
                          background: p.isAvailable ? '#fff1f2' : '#f0fdf4',
                          color: p.isAvailable ? '#be123c' : '#15803d',
                          border: `1px solid ${p.isAvailable ? '#fecdd3' : '#bbf7d0'}`,
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {p.isAvailable ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{p.isAvailable ? 'Hide Listing' : 'Make Live'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

