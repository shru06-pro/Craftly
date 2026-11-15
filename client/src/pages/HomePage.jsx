import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import EditorialHero from '../components/home/EditorialHero.jsx';
import {
  NewArrivalsSection,
  ShopEthnicSection,
  ShopWesternSection,
  CollegeEverydaySection,
  Under999Section,
  PremiumCollectionsSection,
  BestsellingBrandsSection,
} from '../components/home/HomeCuratedSections.jsx';
import OutfitInspiration from '../components/home/OutfitInspiration.jsx';
import ArtisanSpotlight from '../components/home/ArtisanSpotlight.jsx';
import ReviewsSection from '../components/home/ReviewsSection.jsx';
import DispatchNewsletter from '../components/home/DispatchNewsletter.jsx';
import QuickViewModal from '../components/common/QuickViewModal.jsx';
import './HomePage.css';

export default function HomePage() {
  const outletCtx = useOutletContext();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewInitialColor, setQuickViewInitialColor] = useState(null);

  // If a product was chosen from the Shopping Assistant modal, open its quick view / customizer
  useEffect(() => {
    if (outletCtx?.advisorProduct) {
      setQuickViewProduct(outletCtx.advisorProduct);
      setQuickViewInitialColor(outletCtx.advisorProduct.colorVariants?.[0] || null);
      outletCtx.setAdvisorProduct(null);
    }
  }, [outletCtx]);

  const handleSelectProduct = (product, selectedColor) => {
    setQuickViewProduct(product);
    setQuickViewInitialColor(selectedColor || product.colorVariants?.[0] || null);
  };

  return (
    <div className="homepage-root">
      {/* 1. Hero Section with Premium Fashion Photography & Clear Shopping CTA */}
      <EditorialHero />

      {/* 2. New Arrivals */}
      <NewArrivalsSection onSelectProduct={handleSelectProduct} />

      {/* 3. Shop Indian Ethnic */}
      <ShopEthnicSection onSelectProduct={handleSelectProduct} />

      {/* 4. Shop Western */}
      <ShopWesternSection onSelectProduct={handleSelectProduct} />

      {/* 5. Outfit Inspiration (Shop the Complete Look) */}
      <OutfitInspiration />

      {/* 6. College & Everyday Edit */}
      <CollegeEverydaySection onSelectProduct={handleSelectProduct} />

      {/* 7. Under ₹999 */}
      <Under999Section onSelectProduct={handleSelectProduct} />

      {/* 8. Premium Collections */}
      <PremiumCollectionsSection onSelectProduct={handleSelectProduct} />

      {/* 9. Bestselling Indian Brands */}
      <BestsellingBrandsSection />

      {/* 10. Artisan Spotlight */}
      <ArtisanSpotlight />

      {/* Customer Trust Reviews & Dispatch Newsletter */}
      <ReviewsSection />
      <DispatchNewsletter />

      {/* Quick View Modal */}
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
