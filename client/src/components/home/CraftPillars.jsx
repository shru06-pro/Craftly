// src/components/home/CraftPillars.jsx
import React from 'react';
import { Scissors, ShieldCheck, Scale, Leaf } from 'lucide-react';
import './CraftPillars.css';

const PILLARS_DATA = [
  {
    icon: <Scissors size={20} />,
    title: 'Bespoke Sizing & Monograms',
    desc: 'Customize bust, waist, sleeve and kurta lengths directly with master tailors, plus initial thread embroidery on cuffs.',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'GI-Tagged & Verified Ateliers',
    desc: 'Direct from heritage clusters in Hazratganj, Bagru, Maheshwar, and Santiniketan. No machine-printed imitation clones.',
  },
  {
    icon: <Scale size={20} />,
    title: '85%+ Direct to Craftsmen',
    desc: 'Bypassing middlemen mandis so master weavers, block printers and leather artisans receive fair, dignified living earnings.',
  },
  {
    icon: <Leaf size={20} />,
    title: 'Pure Desi Natural Fibres',
    desc: 'Organic Mulmul cotton, unbleached handspun Khadi, wild Tussar silk, river-clay Dabu resist, and natural indigo dyes.',
  },
];

export default function CraftPillars() {
  return (
    <section className="craft-pillars-section" id="manifesto">
      <div className="container">
        <div className="pillars-header">
          <span className="pillars-kicker">The Indian Maker Manifesto</span>
          <h2 className="pillars-main-title">Generational Craft, Handcrafted with Intention</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Four uncompromising principles safeguarding India's rich artisanal heritage and fair weaver compensation.
          </p>
        </div>

        <div className="pillars-grid-4">
          {PILLARS_DATA.map((item, index) => (
            <div key={index} className="pillar-card">
              <div className="pillar-icon-badge">{item.icon}</div>
              <h3 className="pillar-card-title">{item.title}</h3>
              <p className="pillar-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
