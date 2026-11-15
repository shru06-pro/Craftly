// src/pages/store-owner/StoreProductsPage.jsx
import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';
import { formatCurrency } from '../../utils/formatCurrency';

export default function StoreProductsPage() {
  const { token, apiBase } = useAuth();
  const { activeStore } = useActiveStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    basePrice: '',
    leadTimeDays: 7,
    isCustomizable: true,
    initialStock: 10,
    imageUrl: '',
  });

  const loadProducts = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
      } else {
        setError(json.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Network error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Fetch categories for product creation
    fetch(`${apiBase}/catalogue/categories`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setCategories(json.data);
          setForm((f) => ({ ...f, categoryId: json.data[0].id }));
        }
      })
      .catch((e) => console.error('Error fetching categories:', e));
  }, [activeStore, token, apiBase]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        basePrice: parseFloat(form.basePrice),
        leadTimeDays: parseInt(form.leadTimeDays, 10) || 7,
        isCustomizable: form.isCustomizable,
        images: form.imageUrl ? [form.imageUrl] : [],
        variants: [
          {
            name: 'Standard Atelier Fit',
            size: 'Free Size',
            color: 'Natural Unbleached',
            stockQuantity: parseInt(form.initialStock, 10) || 10,
            priceAdjustment: 0,
            sku: `CRAFT-${Date.now().toString().slice(-4)}`,
          },
        ],
      };

      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to create product');
      }

      setShowAddModal(false);
      setForm({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '',
        basePrice: '',
        leadTimeDays: 7,
        isCustomizable: true,
        initialStock: 10,
        imageUrl: '',
      });
      loadProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this handcrafted creation from your listing?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadProducts();
      } else {
        const json = await res.json();
        alert(json.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Network error deleting product');
    }
  };

  if (!activeStore) return <p>Please select an atelier.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="store-header-title">Atelier Product Catalogue</h1>
          <p className="store-header-subtitle" style={{ margin: 0 }}>
            List and manage authentic artisan textiles, decor, and bespoke commissions for {activeStore.studioName || activeStore.name}.
          </p>
        </div>

        <button
          type="button"
          disabled={activeStore.status !== 'APPROVED'}
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {activeStore.status !== 'APPROVED' && (
        <div style={{ padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '6px', marginBottom: '20px' }}>
          Notice: Product creation is unlocked once your atelier application is approved by the curation team.
        </div>
      )}

      {error && (
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Products Table */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--color-sand-50)', borderBottom: '1px solid var(--color-sand-200)', color: 'var(--color-sand-600)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Variants</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-sand-500)' }}>
                  No products listed in this atelier yet.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const totalStock = p.variants?.reduce((acc, v) => acc + (v.stockQuantity || 0), 0) ?? 0;
                const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-sand-100)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={img}
                          alt={p.title}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>{p.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-sand-500)' }}>Lead time: {p.leadTimeDays || 7}d</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-sand-700)' }}>
                      {p.category?.name || 'Handloom'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-espresso)' }}>
                      {formatCurrency(p.basePrice)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: totalStock < 5 ? '#b91c1c' : '#166534',
                          background: totalStock < 5 ? '#fef2f2' : '#f0fdf4',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        {totalStock} units
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-sand-600)' }}>
                      {p.variants?.length || 1} variant(s)
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: p.isAvailable ? '#2b7430' : '#b91c1c' }}>
                        {p.isAvailable ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '4px' }}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
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
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0 }}>Add Handcrafted Product</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Hand-Embroidered Chikankari Chanderi Kurta"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px', background: '#fff' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    placeholder="3450"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Initial Stock Units</label>
                  <input
                    type="number"
                    min={1}
                    value={form.initialStock}
                    onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.leadTimeDays}
                    onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Primary Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Artisan Narrative & Fabric Details *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the fabric weave, stitches, and handloom origin..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-sand-200)', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  id="isCust"
                  checked={form.isCustomizable}
                  onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                />
                <label htmlFor="isCust" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  Accept custom sizing and bespoke motif inquiries for this creation
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  {submitting ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

