import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WishlistPage from './pages/WishlistPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
}

/**
 * Root Application Router
 * Provides CartContext, WishlistContext, and routing hierarchy for Craftly.
 */
export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Main index route */}
              <Route index element={<HomePage />} />

              {/* Dedicated Studio Wishlist page */}
              <Route path="wishlist" element={<WishlistPage />} />

              {/* Product Detail pages (canonical: /product/:id) */}
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="products/:id" element={<LegacyProductRedirect />} />

              {/* 404 Catch-all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}
