// src/components/common/ShopTheLookModal.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ShoppingBag, Heart, ArrowRight, Check, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import './ShopTheLookModal.css';

export default function ShopTheLookModal({ look, isOpen, onClose, onSelectAesthetic }) {
  const { addMultipleToCart, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Selections for each item in the outfit
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isBundleAdded, setIsBundleAdded] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState({});
  const [isLookSaved, setIsLookSaved] = useState(false);

  if (!isOpen || !look) return null;

  // Initialize variant defaults if not set
  const getItemSize = (item) => selectedVariants[item.productId]?.size || item.size || item.availableSizes?.[0] || 'Standard';
  const getItemColor = (item) => selectedVariants[item.productId]?.color || item.color || item.availableColors?.[0] || 'Standard';

  const handleSizeChange = (productId, size) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], size },
    }));
  };

  const handleColorChange = (productId, color) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], color },
    }));
  };

  const bundleTotal = look.items.reduce((sum, item) => sum + item.price, 0);
  const bundleOriginalTotal = look.items.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const discountSavings = bundleOriginalTotal - bundleTotal;

  // Add all items in the look to cart
  const handleAddBundleToCart = () => {
    const bundleItems = look.items.map((item) => {
      const fullProd = MOCK_PRODUCTS.find((p) => p.id === item.productId) || {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
      };

      const selectedColorName = getItemColor(item);
      const selectedSize = getItemSize(item);

      return {
        product: fullProd,
        customization: {
          selectedColor: { name: selectedColorName, image: item.image },
          selectedSize,
          quantity: 1,
        },
      };
    });

    addMultipleToCart(bundleItems);
    setIsBundleAdded(true);
    setTimeout(() => setIsBundleAdded(false), 2500);
  };

  // Add individual item to cart
  const handleAddSingleItem = (item) => {
    const fullProd = MOCK_PRODUCTS.find((p) => p.id === item.productId) || {
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    };

    addToCart(fullProd, {
      selectedColor: { name: getItemColor(item), image: item.image },
      selectedSize: getItemSize(item),
      quantity: 1,
    });

    setAddedItemIds((prev) => ({ ...prev, [item.productId]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.productId]: false }));
    }, 2000);
  };

  // Save full look to wishlist
  const handleToggleSaveLook = () => {
    look.items.forEach((item) => {
      const fullProd = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      if (fullProd && !isInWishlist(fullProd.id)) {
        addToWishlist(fullProd);
      }
    });
    setIsLookSaved(true);
    setTimeout(() => setIsLookSaved(false), 2400);
  };

  return (
    <div className="look-modal-backdrop" onClick={onClose}>
      <div className="look-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="look-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="look-modal-grid">
          {/* Left Column: Outfit Hero Image & Aesthetic info */}
          <div className="look-modal-media-col">
            <div className="look-hero-image-wrap">
              <img src={look.image} alt={look.title} className="look-hero-img" />
              <div className="look-hero-gradient-overlay" />

              <div className="look-badge-container">
                <span className="look-aesthetic-pill">
                  <Sparkles size={12} />
                  <span>{look.aesthetic}</span>
                </span>
                <span className="look-occasion-pill">{look.occasion}</span>
              </div>
            </div>

            <div className="look-info-panel">
              <h2 className="look-title">{look.title}</h2>
              <p className="look-desc">{look.description}</p>

              <button
                type="button"
                className={`look-wishlist-toggle-btn ${isLookSaved ? 'saved' : ''}`}
                onClick={handleToggleSaveLook}
              >
                <Heart size={15} fill={isLookSaved ? 'currentColor' : 'none'} />
                <span>{isLookSaved ? 'Saved All Pieces to Wishlist' : 'Save Full Look to Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Pieces Breakdown & Bundle Checkout */}
          <div className="look-modal-details-col">
            <div className="look-details-header">
              <div>
                <span className="look-subhead-tag">Outfit Inspiration</span>
                <h3 className="look-pieces-title">Included Products ({look.items.length})</h3>
              </div>
              <span className="bundle-save-tag">
                Save {formatCurrency(discountSavings)} on Bundle
              </span>
            </div>

            {/* List of included pieces */}
            <div className="look-items-list">
              {look.items.map((item) => {
                const currentSize = getItemSize(item);
                const currentColor = getItemColor(item);
                const isSingleAdded = addedItemIds[item.productId];

                return (
                  <div key={item.productId} className="look-item-card">
                    <img src={item.image} alt={item.name} className="look-item-thumb" />

                    <div className="look-item-content">
                      <div className="look-item-top">
                        <h4 className="look-item-name">{item.name}</h4>
                        <div className="look-item-price-row">
                          <span className="look-item-price">{formatCurrency(item.price)}</span>
                          {item.originalPrice && (
                            <span className="look-item-original-price">{formatCurrency(item.originalPrice)}</span>
                          )}
                        </div>
                      </div>

                      {/* Variant selectors */}
                      <div className="look-item-selectors">
                        {item.availableSizes && item.availableSizes.length > 1 && (
                          <div className="selector-group">
                            <label className="selector-label">Size:</label>
                            <select
                              value={currentSize}
                              onChange={(e) => handleSizeChange(item.productId, e.target.value)}
                              className="look-select"
                            >
                              {item.availableSizes.map((sz) => (
                                <option key={sz} value={sz}>
                                  {sz}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {item.availableColors && item.availableColors.length > 1 && (
                          <div className="selector-group">
                            <label className="selector-label">Color:</label>
                            <select
                              value={currentColor}
                              onChange={(e) => handleColorChange(item.productId, e.target.value)}
                              className="look-select"
                            >
                              {item.availableColors.map((cl) => (
                                <option key={cl} value={cl}>
                                  {cl}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Item Actions */}
                      <div className="look-item-actions">
                        <Link
                          to={`/product/${item.productId}`}
                          className="btn-view-product-link"
                          onClick={onClose}
                        >
                          <ExternalLink size={13} />
                          <span>View Product</span>
                        </Link>

                        <button
                          type="button"
                          className={`btn-single-add ${isSingleAdded ? 'added' : ''}`}
                          onClick={() => handleAddSingleItem(item)}
                        >
                          {isSingleAdded ? (
                            <>
                              <Check size={13} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              <span>Shop Item</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle Checkout Box */}
            <div className="look-bundle-footer">
              <div className="bundle-price-summary">
                <div className="bundle-price-labels">
                  <span className="bundle-total-label">Complete Look Total:</span>
                  <span className="bundle-items-count">({look.items.length} verified pieces)</span>
                </div>
                <div className="bundle-price-values">
                  <span className="bundle-total-amount">{formatCurrency(bundleTotal)}</span>
                  {bundleOriginalTotal > bundleTotal && (
                    <span className="bundle-orig-amount">{formatCurrency(bundleOriginalTotal)}</span>
                  )}
                </div>
              </div>

              <div className="bundle-actions-row">
                <button
                  type="button"
                  className={`btn-primary btn-add-bundle ${isBundleAdded ? 'bundle-added' : ''}`}
                  onClick={handleAddBundleToCart}
                >
                  {isBundleAdded ? (
                    <>
                      <Check size={16} />
                      <span>Complete Outfit Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add Complete Outfit to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Explore Similar Combinations */}
              <div className="explore-combinations-row">
                <span className="explore-label">Explore similar aesthetic:</span>
                <button
                  type="button"
                  className="btn-similar-tag"
                  onClick={() => {
                    if (onSelectAesthetic) onSelectAesthetic(look.aestheticId || look.aesthetic);
                    onClose();
                  }}
                >
                  <span>More {look.aesthetic} Looks</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

