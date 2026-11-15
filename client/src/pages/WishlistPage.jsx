// src/pages/WishlistPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, MapPin, Sparkles, Clock, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatCurrency';
import { getProductPreviewImage, getCraftlyFallbackSvg } from '../utils/productCustomization';
import './WishlistPage.css';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedItemIds, setAddedItemIds] = useState({});

  const handleQuickAdd = (product) => {
    addToCart(product, {
      selectedColor: product.colorVariants?.[0] || null,
      selectedSize: product.availableSizes?.[0] || 'Standard',
      quantity: 1,
    });

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="wishlist-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Studio Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="wishlist-header-row">
          <div>
            <div className="wishlist-kicker">
              <Sparkles size={14} color="var(--color-terracotta)" />
              <span>Curated Personal Atelier</span>
            </div>
            <h1 className="wishlist-title">Saved Artisan Creations</h1>
            <p className="wishlist-subtitle">
              {wishlist.length === 0
                ? 'Your personalized collection of handcrafted Indian masterworks.'
                : `You have ${wishlist.length} handcrafted ${wishlist.length === 1 ? 'piece' : 'pieces'} saved for your wardrobe & home.`}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              type="button"
              className="btn-clear-wishlist"
              onClick={clearWishlist}
              title="Remove all saved items"
            >
              Clear Entire Wishlist
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty-card">
            <div className="wishlist-empty-icon-wrap">
              <Heart size={48} strokeWidth={1.5} color="var(--color-terracotta)" />
            </div>
            <h2 className="wishlist-empty-title">Your Studio Wishlist is Empty</h2>
            <p className="wishlist-empty-desc">
              Explore 32-stitch Lucknowi Chikankari kurtas, authentic Bagru mud-resist block prints,
              hand-hammered Kundan jewelry, and vegetable-tanned Santiniketan leather accessories.
            </p>
            <div className="wishlist-empty-cta-group">
              <Link to="/" className="btn-primary">
                Explore Curated Collections
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="wishlist-grid">
            {wishlist.map((product) => {
              const previewImg = getProductPreviewImage(product, product.colorVariants?.[0]);
              const isAdded = addedItemIds[product.id];

              return (
                <article key={product.id} className="wishlist-card">
                  {/* Thumbnail Column */}
                  <div
                    className="wishlist-card-thumb-wrap"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                    title={`View details for ${product.name}`}
                  >
                    <img
                      src={previewImg}
                      alt={product.name}
                      className="wishlist-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getCraftlyFallbackSvg(product);
                      }}
                    />

                    {/* Quick remove heart button */}
                    <button
                      type="button"
                      className="wishlist-remove-float-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeFromWishlist(product.id);
                      }}
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Body Column */}
                  <div className="wishlist-card-body">
                    <div className="wishlist-card-artisan">
                      <span className="wishlist-artisan-location">
                        <MapPin size={12} color="var(--color-terracotta)" />
                        {product.artisan?.studio} • {product.artisan?.location}
                      </span>
                      <span className="wishlist-rating">
                        <Star size={12} fill="currentColor" />
                        <strong>{product.rating}</strong>
                        <span style={{ color: 'var(--color-muted)' }}>({product.reviewCount})</span>
                      </span>
                    </div>

                    <h3
                      className="wishlist-card-name"
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </h3>

                    <p className="wishlist-card-desc">{product.shortDescription}</p>

                    {/* Specs chips */}
                    <div className="wishlist-card-specs">
                      <span className="wishlist-spec-pill">
                        <Clock size={11} style={{ marginRight: '4px' }} />
                        {product.leadTime}
                      </span>
                      {product.colorVariants && product.colorVariants.length > 0 && (
                        <span className="wishlist-spec-pill">
                          {product.colorVariants.length} artisan shades
                        </span>
                      )}
                    </div>

                    {/* Price and actions */}
                    <div className="wishlist-card-footer">
                      <div className="wishlist-price-wrap">
                        <span className="wishlist-price">{formatINR(product.price)}</span>
                        {product.originalPrice && (
                          <span className="wishlist-orig-price">{formatINR(product.originalPrice)}</span>
                        )}
                      </div>

                      <div className="wishlist-actions-wrap">
                        <button
                          type="button"
                          className="btn-wishlist-cart"
                          onClick={() => handleQuickAdd(product)}
                        >
                          {isAdded ? (
                            <>
                              <Check size={14} /> Added!
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} /> Add to Bag
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn-wishlist-view"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          View Piece
                        </button>

                        <button
                          type="button"
                          className="btn-wishlist-remove"
                          onClick={() => removeFromWishlist(product.id)}
                          title="Remove item"
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
