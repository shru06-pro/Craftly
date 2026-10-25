// src/components/home/DispatchNewsletter.jsx
import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import './DispatchNewsletter.css';

export default function DispatchNewsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="dispatch-section">
      <div className="container">
        <div className="dispatch-envelope-card">
          <div className="dispatch-postmark">
            <span>Craftly</span>
            <span>Studio</span>
            <span>Dispatch</span>
          </div>

          <h2 className="dispatch-title">The Artisan Dispatch</h2>
          <p className="dispatch-desc">
            Field notes from small weaving & leather studios, natural dye recipe journals, and private invitations to limited batch drops. Sent fortnightly, strictly zero spam.
          </p>

          {subscribed ? (
            <div className="dispatch-success-box">
              <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              Welcome to the Guild Dispatch. We have sent your first studio journal to {email}.
            </div>
          ) : (
            <form className="dispatch-form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your studio or personal email..."
                className="dispatch-input"
                aria-label="Email address for dispatch"
              />
              <button type="submit" className="btn-primary">
                Join Dispatch
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
