// src/components/layout/AnnouncementBar.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside className="announcement-bar" aria-label="Store Announcement">
      <div className="container announcement-container">
        <p className="announcement-text">
          Free Delivery on Orders ₹1,499+ | Complimentary Monogram &amp; Custom Tailoring
        </p>
        <button
          type="button"
          className="announcement-dismiss"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          title="Dismiss announcement"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
}
