// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import ShoppingAssistant from '../common/ShoppingAssistant';

/**
 * Main Layout Shell
 * Keeps AnnouncementBar, Navbar, Footer, and persistent CartDrawer active.
 * Hosts the Indian Craft Shopping Assistant and floating advisor widget.
 */
export default function Layout() {
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorProduct, setAdvisorProduct] = useState(null);

  return (
    <div className="app-container">
      <AnnouncementBar />
      <Navbar />
      <main className="main-content">
        <Outlet context={{ advisorProduct, setAdvisorProduct }} />
      </main>
      <Footer />

      {/* Global Shopping Studio Bag Drawer */}
      <CartDrawer />

      {/* Indian Craft & Fit Shopping Assistant & Floating AI Widget */}
      <ShoppingAssistant
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        onOpen={() => setIsAdvisorOpen(true)}
        onSelectProduct={(product) => {
          setAdvisorProduct(product);
          const el = document.getElementById('collections');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
