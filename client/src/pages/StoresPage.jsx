import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, MapPin, Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import './StoresPage.css';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('http://localhost:4000/v1/stores');
        if (res.ok) {
          const json = await res.json();
          setStores(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch stores:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  // Filter stores by search query and state
  const filteredStores = stores.filter((store) => {
    const q = searchQuery.toLowerCase().trim();
    const matchName = store.studioName.toLowerCase().includes(q) || store.name.toLowerCase().includes(q);
    const matchCraft = store.craft.toLowerCase().includes(q);
    const matchLocation = store.location.toLowerCase().includes(q) || store.state.toLowerCase().includes(q);

    if (q && !matchName && !matchCraft && !matchLocation) return false;
    if (selectedState !== 'all' && store.state.toLowerCase() !== selectedState.toLowerCase()) return false;

    return true;
  });

  const uniqueStates = Array.from(new Set(stores.map((s) => s.state))).filter(Boolean);

  return (
    <div className="stores-page-root">
      {/* Stores Page Header */}
      <section className="stores-header-banner">
        <div className="container">
          <div className="stores-header-badge">
            <Store size={14} color="var(--color-terracotta)" />
            <span>Independent Local Businesses</span>
          </div>
          <h1 className="stores-page-title">Discover Master Artisan Ateliers Across India</h1>
          <p className="stores-page-subtitle">
            Shop directly from certified master artisans, family guilds, and heritage craft collectives.
            Each store crafts and dispatches authentic heirlooms directly from their workshop.
          </p>
        </div>
      </section>

      {/* Stores Filter & Search Bar */}
      <section className="stores-list-section">
        <div className="container">
          <div className="stores-controls-bar">
            <div className="stores-search-wrap">
              <Search size={16} className="stores-search-icon" />
              <input
                type="text"
                placeholder="Search by atelier name, craft technique, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="stores-search-input"
                aria-label="Search stores"
              />
            </div>

            {/* State filter buttons */}
            <div className="stores-state-pills">
              <button
                type="button"
                className={`state-pill-btn ${selectedState === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedState('all')}
              >
                All States ({stores.length})
              </button>
              {uniqueStates.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`state-pill-btn ${selectedState === st ? 'active' : ''}`}
                  onClick={() => setSelectedState(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Stores Grid */}
          {loading ? (
            <div className="stores-loading-state">
              <p>Discovering verified artisan studios across India...</p>
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="stores-grid">
              {filteredStores.map((store) => (
                <div key={store.id} className="store-card">
                  <div className="store-card-header">
                    <img
                      src={store.bannerUrl || store.sampleProducts?.[0]?.image || store.avatarUrl || '/images/chikankari/ivory.jpg'}
                      alt={store.studioName}
                      className="store-card-banner"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="store-card-avatar-wrap">
                      <img
                        src={store.avatarUrl || '/images/chikankari/ivory.jpg'}
                        alt={store.name}
                        className="store-card-avatar"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    </div>
                    {store.badge ? (
                      <span className="store-card-badge">{store.badge}</span>
                    ) : store.verified ? (
                      <span className="store-card-badge verified">Verified Atelier</span>
                    ) : null}
                  </div>

                  <div className="store-card-body">
                    <div className="store-card-location">
                      <MapPin size={12} color="var(--color-terracotta)" style={{ marginRight: '4px' }} />
                      <span>{store.location}, {store.state}</span>
                    </div>

                    <h2 className="store-card-title">{store.studioName}</h2>
                    <p className="store-card-owner">Master Artisan: <strong>{store.name}</strong></p>

                    <div className="store-card-craft-tag">{store.craft}</div>

                    <p className="store-card-bio">{store.bio}</p>

                    <div className="store-card-meta-row">
                      <span className="store-lead-time">
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {store.leadTimeMinDays}–{store.leadTimeMaxDays} Days Craft Time
                      </span>
                      <span className="store-products-count">
                        {store.productCount} Creations Available
                      </span>
                    </div>

                    {/* Sample product previews */}
                    {store.sampleProducts && store.sampleProducts.length > 0 && (
                      <div className="store-sample-preview-row">
                        <span className="sample-label">Signature pieces:</span>
                        <div className="sample-thumbs-list">
                          {store.sampleProducts.map((p) => (
                            <img
                              key={p.id}
                              src={p.image}
                              alt={p.name}
                              title={`${p.name} (₹${p.price})`}
                              className="sample-thumb-img"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="store-card-footer">
                      <Link to={`/stores/${store.id}`} className="btn-primary store-visit-btn">
                        <span>Visit Store & Creations</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stores-empty-state">
              <Store size={40} color="var(--color-terracotta)" />
              <h3>No Artisan Ateliers Match Your Search</h3>
              <p>Try clearing filters or search terms to browse our full network of verified master makers.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedState('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

