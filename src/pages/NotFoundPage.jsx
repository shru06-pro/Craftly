// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-4)' }}>
      <div style={{
        display: 'inline-flex',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-sand-100)',
        marginBottom: 'var(--space-4)',
        color: 'var(--color-terracotta)'
      }}>
        <Compass size={40} />
      </div>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Studio Page Not Found</h1>
      <p style={{ maxWidth: '420px', margin: '0 auto var(--space-6)', color: 'var(--color-muted)' }}>
        The bespoke item or studio showcase you are looking for has been moved or is still in development.
      </p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>
        Return to Marketplace
      </Link>
    </div>
  );
}
