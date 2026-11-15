import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Mail,
  Phone,
  Store,
  Scissors
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';
import { formatINR } from '../utils/formatCurrency';
import './StoreDetailPage.css';

export default function StoreDetailPage() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewInitialColor, setQuickViewInitialColor] = useState(null);

  useEffect(() => {
    async function fetchStoreDetails() {
      try {
        const res = await fetch(`http://localhost:4000/v1/stores/${id}`);
        if (!res.ok) {
          throw new Error('Store not found');
        }
        const json = await res.json();
        setStore(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="store-detail-loading">
        <p>Loading master artisan atelier...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="container store-detail-error">
        <Store size={48} color="var(--color-terracotta)" />
        <h2>Atelier Not Found</h2>
        <p>This artisan store may be temporarily inactive or reviewing its catalogue.</p>
        <Link to="/stores" className="btn-primary">
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Return to All Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="store-detail-root">
      {/* Store Banner & Bio Header */}
      <div className="store-banner-wrap">
        <img
          src={store.bannerUrl || store.avatarUrl || '/images/chikankari/ivory.jpg'}
          alt={store.studioName}
          className="store-hero-banner"
        />
        <div className="store-banner-overlay" />
      </div>

      <div className="container store-profile-container">
        <div className="store-profile-card">
          <div className="store-profile-top-row">
            <div className="store-avatar-box">
              <img
                src={store.avatarUrl || '/images/chikankari/ivory.jpg'}
                alt={store.name}
                className="store-profile-avatar"
              />
            </div>

            <div className="store-profile-headings">
              <div className="store-badge-row">
                <span className="store-craft-pill">{store.craft}</span>
                {store.badge && <span className="store-badge-pill">{store.badge}</span>}
                <span className="store-verified-pill">
                  <ShieldCheck size={13} style={{ marginRight: '3px' }} /> Verified Atelier
                </span>
              </div>
              <h1 className="store-studio-title">{store.studioName}</h1>
              <p className="store-master-artisan">
                Master Artisan: <strong>{store.name}</strong> •{' '}
                <span className="store-location-text">
                  <MapPin size={12} color="var(--color-terracotta)" style={{ display: 'inline', marginRight: '2px' }} />
                  {store.location}, {store.state}
                </span>
              </p>
            </div>
          </div>

          <div className="store-profile-desc-box">
            <p className="store-bio-text">{store.bio}</p>
          </div>

          <div className="store-profile-meta-bar">
            <div className="meta-pill">
              <Clock size={14} color="var(--color-terracotta)" />
              <span>Typical Craft Time: {store.leadTimeMinDays}–{store.leadTimeMaxDays} business days</span>
            </div>
            <div className="meta-pill">
              <Scissors size={14} color="var(--color-terracotta)" />
              <span>Bespoke sizing & tailoring available on apparel</span>
            </div>
            <div className="meta-pill">
              <Sparkles size={14} color="var(--color-terracotta)" />
              <span>100% direct artisan compensation</span>
            </div>
          </div>
        </div>

        {/* Store Catalogue Grid */}
        <section className="store-creations-section">
          <div className="store-creations-header">
            <div>
              <span className="section-tag">Direct from Atelier</span>
              <h2 className="section-title">Creations by {store.studioName}</h2>
              <p className="section-subtitle">
                Showing {store.products?.length || 0} handcrafted heirloom pieces currently available from this workshop.
              </p>
            </div>
            <Link to="/stores" className="back-stores-link">
              <ArrowLeft size={14} style={{ marginRight: '4px' }} /> All Stores
            </Link>
          </div>

          {store.products && store.products.length > 0 ? (
            <div className="products-preview-grid">
              {store.products.map((product) => {
                // Adapt to ProductCard schema
                const cardProduct = {
                  ...product,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  shortDescription: product.description,
                  artisan: {
                    name: store.name,
                    studio: store.studioName,
                    location: store.location,
                    state: store.state,
                  },
                };

                return (
                  <ProductCard
                    key={product.id}
                    product={cardProduct}
                    onSelect={(item, color) => {
                      setQuickViewProduct(item);
                      setQuickViewInitialColor(color || item.colorVariants?.[0] || null);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="store-empty-products">
              <p>This atelier is currently working on upcoming craft releases. Check back soon!</p>
            </div>
          )}
        </section>
      </div>

      {/* Quick View / Custom Dress Sizing Modal Dialog */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          initialColor={quickViewInitialColor}
          onClose={() => {
            setQuickViewProduct(null);
            setQuickViewInitialColor(null);
          }}
        />
      )}
    </div>
  );
}

