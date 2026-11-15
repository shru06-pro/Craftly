// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts & Guards
import Layout from './components/layout/Layout';
import { ProtectedRoute, StoreOwnerRoute, AdminRoute } from './components/common/RouteGuards';

// Public Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterStorePage from './pages/auth/RegisterStorePage';

// Customer Account Pages
import CustomerLayout from './pages/account/CustomerLayout';
import CustomerProfilePage from './pages/account/CustomerProfilePage';
import CustomerOrdersPage from './pages/account/CustomerOrdersPage';
import CustomerOrderDetailPage from './pages/account/CustomerOrderDetailPage';
import CustomerCustomizationsPage from './pages/account/CustomerCustomizationsPage';
import CustomerAddressesPage from './pages/account/CustomerAddressesPage';
import CustomerPreferencesPage from './pages/account/CustomerPreferencesPage';

// Store Owner Pages
import StoreOwnerLayout from './pages/store-owner/StoreOwnerLayout';
import StoreDashboardPage from './pages/store-owner/StoreDashboardPage';
import StoreSwitcherPage from './pages/store-owner/StoreSwitcherPage';
import StoreProductsPage from './pages/store-owner/StoreProductsPage';
import StoreInventoryPage from './pages/store-owner/StoreInventoryPage';
import StoreOrdersPage from './pages/store-owner/StoreOrdersPage';
import StoreCustomizationsPage from './pages/store-owner/StoreCustomizationsPage';
import StoreProfilePage from './pages/store-owner/StoreProfilePage';
import StoreAnalyticsPage from './pages/store-owner/StoreAnalyticsPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminStoreApplicationsPage from './pages/admin/AdminStoreApplicationsPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminAdminsPage from './pages/admin/AdminAdminsPage';

import './App.css';

function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Shell */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="stores" element={<StoresPage />} />
                <Route path="stores/:slug" element={<StoreDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="product/:id" element={<ProductDetailPage />} />
                <Route path="products/:id" element={<LegacyProductRedirect />} />

                {/* Authentication Pages */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="register-store" element={<RegisterStorePage />} />

                {/* Customer Account Suite (Protected) */}
                <Route
                  path="account"
                  element={
                    <ProtectedRoute>
                      <CustomerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CustomerProfilePage />} />
                  <Route path="orders" element={<CustomerOrdersPage />} />
                  <Route path="orders/:orderNumber" element={<CustomerOrderDetailPage />} />
                  <Route path="customizations" element={<CustomerCustomizationsPage />} />
                  <Route path="preferences" element={<CustomerPreferencesPage />} />
                  <Route path="addresses" element={<CustomerAddressesPage />} />
                </Route>

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Store Owner Dashboard Suite (Protected) */}
              <Route
                path="store-owner"
                element={
                  <StoreOwnerRoute>
                    <StoreOwnerLayout />
                  </StoreOwnerRoute>
                }
              >
                <Route index element={<StoreDashboardPage />} />
                <Route path="stores" element={<StoreSwitcherPage />} />
                <Route path="products" element={<StoreProductsPage />} />
                <Route path="inventory" element={<StoreInventoryPage />} />
                <Route path="orders" element={<StoreOrdersPage />} />
                <Route path="customizations" element={<StoreCustomizationsPage />} />
                <Route path="profile" element={<StoreProfilePage />} />
                <Route path="analytics" element={<StoreAnalyticsPage />} />
              </Route>

              {/* Admin Dashboard Suite (Protected) */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminOverviewPage />} />
                <Route path="store-applications" element={<AdminStoreApplicationsPage />} />
                <Route path="stores" element={<AdminStoresPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="administrators" element={<AdminAdminsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
