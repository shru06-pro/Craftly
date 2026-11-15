// src/pages/store-owner/StoreInventoryPage.jsx
import React, { useEffect, useState } from 'react';
import { Layers, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveStore } from './StoreOwnerLayout';

export default function StoreInventoryPage() {
  const { token, apiBase } = useAuth();
  const { activeStore } = useActiveStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/products`, {
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
    loadData();
  }, [activeStore, token, apiBase]);

  const handleStockChange = (variantId, val) => {
    setStockUpdates({ ...stockUpdates, [variantId]: val });
  };

  const saveStock = async (variantId) => {
    const qty = parseInt(stockUpdates[variantId], 10);
    if (isNaN(qty) || qty < 0) return;

    setSavingId(variantId);
    try {
      const res = await fetch(`${apiBase}/store-owner/stores/${activeStore.id}/inventory/variant/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stockQuantity: qty }),
      });

      if (res.ok) {
        // Clear local override and reload
        const next = { ...stockUpdates };
        delete next[variantId];
        setStockUpdates(next);
        await loadData();
      } else {
        const json = await res.json();
        alert(json.message || 'Failed to update stock');
      }
    } catch (err) {
      alert('Error saving stock');
    } finally {
      setSavingId(null);
    }
  };

  if (!activeStore) return <p>Please select an atelier.</p>;

  // Flatten variants
  const variants = [];
  products.forEach((p) => {
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v) => {
        variants.push({
          ...v,
          productTitle: p.title,
          productId: p.id,
          productImage: p.images?.[0]?.url,
        });
      });
    } else {
      variants.push({
        id: `mock-${p.id}`,
        name: 'Standard Atelier Fit',
        sku: `SKU-${p.id.slice(0, 4)}`,
        stockQuantity: 10,
        productTitle: p.title,
        productId: p.id,
        productImage: p.images?.[0]?.url,
      });
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="store-header-title">Loom & Atelier Inventory Control</h1>
          <p className="store-header-subtitle" style={{ margin: 0 }}>
            Real-time stock quantities across all variants and sizes for {activeStore.studioName || activeStore.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="btn btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} />
          <span>Refresh Stock</span>
        </button>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid var(--color-sand-200)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--color-sand-50)', borderBottom: '1px solid var(--color-sand-200)', color: 'var(--color-sand-600)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product & Variant</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>SKU</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Current Stock</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Update Quantity</th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-sand-500)' }}>
                  No inventory tracked yet. Add products to populate inventory records.
                </td>
              </tr>
            ) : (
              variants.map((v) => {
                const currentQty = stockUpdates[v.id] !== undefined ? stockUpdates[v.id] : v.stockQuantity;
                const isLow = (v.stockQuantity || 0) < 5;
                const isSaving = savingId === v.id;

                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--color-sand-100)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>{v.productTitle}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-sand-600)' }}>
                        {v.name} {v.size ? `• Size: ${v.size}` : ''} {v.color ? `• Color: ${v.color}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--color-sand-700)' }}>
                      {v.sku || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>
                      {v.stockQuantity} units
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isLow ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#b91c1c', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px' }}>
                          <AlertTriangle size={12} /> LOW STOCK
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px' }}>
                          IN STOCK
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min={0}
                          value={currentQty}
                          onChange={(e) => handleStockChange(v.id, e.target.value)}
                          style={{ width: '70px', padding: '6px 8px', border: '1px solid var(--color-sand-300)', borderRadius: '4px', fontSize: '13px', textAlign: 'center' }}
                        />
                        <button
                          type="button"
                          disabled={isSaving || stockUpdates[v.id] === undefined || String(stockUpdates[v.id]) === String(v.stockQuantity)}
                          onClick={() => saveStock(v.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {isSaving ? '...' : 'Save'}
                        </button>
                      </div>
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

