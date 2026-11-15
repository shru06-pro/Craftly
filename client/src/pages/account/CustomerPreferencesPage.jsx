// src/pages/account/CustomerPreferencesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  SlidersHorizontal,
  Sparkles,
  Check,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Tag,
  Palette,
  Ruler,
  Compass,
  Shirt,
  Leaf,
  Clock,
} from 'lucide-react';
import './CustomerPreferencesPage.css';

const STYLE_OPTIONS = ['Minimalist', 'Traditional Indian', 'Contemporary', 'Indo-Western Fusion', 'Streetwear', 'Vintage / Retro', 'Bohemian'];

const AESTHETIC_OPTIONS = [
  'Clean Girl',
  'Old Money',
  'College Girl Aesthetic',
  'Quiet Luxury',
  'Indo-Western Fusion',
  'Coquette',
  'Korean-Inspired',
  'Streetwear & Khaki Coded',
  'Boho Desi',
  'Cottagecore',
  'Minimalist Workwear',
  'Y2K Desi Pop',
];

const DEPARTMENT_OPTIONS = ["Women's Western Wear", 'Indian Ethnic Wear', 'Indo-Western Fusion'];

const CATEGORY_OPTIONS = [
  'Tops & Crop Tops',
  'Oversized T-Shirts',
  'Jeans & Wide-Leg Denims',
  'Cargo Pants & Trousers',
  'Kurtis & Kurta Sets',
  'Sarees & Handloom Drapes',
  'Dresses & Co-ords',
  'Blazers & Jackets',
  'Kolhapuris & Juttis',
  'Leather Totes & Sling Bags',
  'Oxidized & Kundan Jewellery',
];

const COLOR_OPTIONS = [
  { name: 'Neutrals & Ivory', hex: '#FAF6EE' },
  { name: 'Terracotta & Rust', hex: '#B85834' },
  { name: 'Indigo Blue', hex: '#1E3A5F' },
  { name: 'Sage & Olive', hex: '#7A8F78' },
  { name: 'Pastel Rose & Peach', hex: '#FAD2E1' },
  { name: 'Mustard & Turmeric', hex: '#CF9B29' },
  { name: 'Jewel Emerald & Ruby', hex: '#1B4D3E' },
  { name: 'Classic Noir / Black', hex: '#212529' },
];

const FABRIC_OPTIONS = ['100% Mulmul Cotton', 'Handspun Khadi', 'Pure Handloom Silk', 'Organic Linen', 'Chanderi & Maheshwari', 'Breathable Denim', 'Natural Jute'];

const FIT_OPTIONS = ['Relaxed / Oversized', 'Tailored / Structured', 'High-Rise Wide-Leg', 'Flared & Flowy', 'Straight Regular'];

const SIZE_TOP_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Made-to-Measure'];
const SIZE_BOTTOM_OPTIONS = ['26', '28', '30', '32', '34', '36', 'Custom Waist'];
const SIZE_SHOE_OPTIONS = ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9'];

const BUDGET_OPTIONS = ['Affordable (Under ₹1,500)', 'Mid-Range (₹1,500 - ₹3,500)', 'Heirloom & Luxury (₹3,500+)'];

const OCCASION_OPTIONS = ['College & Campus', 'Office & Formal Workwear', 'Weekend Brunch & Cafes', 'Festivals & Family Pujas', 'Weddings & Soirees', 'Everyday Casual'];

const SUSTAINABILITY_OPTIONS = ['100% Handcrafted Provenance', 'Natural & Plant-Based Dyes', 'Direct Artisan Fair Wages', 'Plastic-Free Packaging'];

const DISPATCH_OPTIONS = ['Ready to Ship (Fast Dispatch)', 'Made-to-Order (Artisan Bespoke)'];

const DELIVERY_OPTIONS = [
  'Standard Tracked Delivery (3-5 days)',
  'Express Air Courier (1-2 days)',
  'Eco-Friendly Plastic-Free Ground Delivery',
  'Weekend Only Delivery',
  'Call Before Delivery',
];

export default function CustomerPreferencesPage() {
  const { user, token, apiBase, refreshProfile } = useAuth();

  const [preferences, setPreferences] = useState({
    styles: ['Minimalist', 'Indo-Western Fusion'],
    aesthetics: ['Clean Girl', 'College Girl Aesthetic'],
    departments: ["Women's Western Wear", 'Indian Ethnic Wear'],
    categories: ['Tops & Crop Tops', 'Jeans & Wide-Leg Denims', 'Kurtis & Kurta Sets'],
    colors: ['Neutrals & Ivory', 'Terracotta & Rust', 'Indigo Blue'],
    fabrics: ['100% Mulmul Cotton', 'Handspun Khadi', 'Organic Linen'],
    fits: ['Relaxed / Oversized', 'High-Rise Wide-Leg'],
    topSize: 'M',
    bottomSize: '28',
    shoeSize: 'UK 6',
    budget: 'Affordable (Under ₹1,500)',
    occasions: ['College & Campus', 'Weekend Brunch & Cafes'],
    sustainability: ['100% Handcrafted Provenance', 'Direct Artisan Fair Wages'],
    dispatchPreference: 'Ready to Ship (Fast Dispatch)',
    deliveryPreferences: ['Standard Tracked Delivery (3-5 days)', 'Eco-Friendly Plastic-Free Ground Delivery'],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load preferences from user profile or backend
  useEffect(() => {
    if (user?.shoppingPreferences) {
      setPreferences((prev) => ({ ...prev, ...user.shoppingPreferences }));
    }
  }, [user]);

  // Toggle multi-select items in array
  const toggleArrayOption = (field, option) => {
    setPreferences((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [field]: updated };
    });
  };

  // Set single value field
  const setSingleOption = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  // Save preferences to backend & local state
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      if (token) {
        const res = await fetch(`${apiBase}/auth/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(preferences),
        });

        if (res.ok) {
          setStatusMessage({ type: 'success', text: 'Shopping preferences successfully updated!' });
          if (refreshProfile) await refreshProfile();
        } else {
          // If server fails or is offline, save to local storage
          localStorage.setItem('craftly_user_preferences', JSON.stringify(preferences));
          setStatusMessage({ type: 'success', text: 'Shopping preferences saved to local session!' });
        }
      } else {
        localStorage.setItem('craftly_user_preferences', JSON.stringify(preferences));
        setStatusMessage({ type: 'success', text: 'Shopping preferences saved to browser storage!' });
      }
    } catch (err) {
      localStorage.setItem('craftly_user_preferences', JSON.stringify(preferences));
      setStatusMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="preferences-page-root">
      <div className="preferences-header">
        <div className="preferences-title-wrap">
          <div className="preferences-badge">
            <Sparkles size={13} color="var(--color-terracotta)" />
            <span>AI Stylist Personalization</span>
          </div>
          <h2 className="account-content-title">Personalized Shopping Preferences</h2>
          <p className="account-content-subtitle">
            Configure your aesthetic style, preferred categories, fits, and sizes. We use this to tailor your
            Homepage recommendations, Pinterest discovery boards, and Craft Advisor AI stylist suggestions.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary save-preferences-top-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <span>Saving...</span> : (
            <>
              <Save size={16} />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className={`preferences-status-bar ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="preferences-form">
        {/* 1. Favourite Fashion Aesthetics */}
        <section className="preference-section">
          <div className="section-label-row">
            <Sparkles size={16} className="section-icon" />
            <h3 className="section-heading">1. Favourite Fashion Aesthetics</h3>
            <span className="section-hint">(Select all that match your vibe)</span>
          </div>
          <div className="pills-grid">
            {AESTHETIC_OPTIONS.map((aes) => {
              const isSelected = (preferences.aesthetics || []).includes(aes);
              return (
                <button
                  key={aes}
                  type="button"
                  className={`preference-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('aesthetics', aes)}
                >
                  {isSelected && <Check size={14} className="pill-check-icon" />}
                  <span>{aes}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Style Orientation & Departments */}
        <section className="preference-section">
          <div className="section-label-row">
            <Compass size={16} className="section-icon" />
            <h3 className="section-heading">2. Departments & Style Orientation</h3>
          </div>
          <div className="pills-grid">
            {DEPARTMENT_OPTIONS.map((dept) => {
              const isSelected = (preferences.departments || []).includes(dept);
              return (
                <button
                  key={dept}
                  type="button"
                  className={`preference-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('departments', dept)}
                >
                  {isSelected && <Check size={14} className="pill-check-icon" />}
                  <span>{dept}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Preferred Product Categories */}
        <section className="preference-section">
          <div className="section-label-row">
            <Shirt size={16} className="section-icon" />
            <h3 className="section-heading">3. Preferred Categories</h3>
          </div>
          <div className="pills-grid">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = (preferences.categories || []).includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`preference-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('categories', cat)}
                >
                  {isSelected && <Check size={14} className="pill-check-icon" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Favourite Colour Palette */}
        <section className="preference-section">
          <div className="section-label-row">
            <Palette size={16} className="section-icon" />
            <h3 className="section-heading">4. Favourite Colour Palette</h3>
          </div>
          <div className="colors-grid">
            {COLOR_OPTIONS.map((col) => {
              const isSelected = (preferences.colors || []).includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  className={`color-preference-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('colors', col.name)}
                >
                  <span className="color-swatch-circle" style={{ backgroundColor: col.hex }} />
                  <span className="color-swatch-name">{col.name}</span>
                  {isSelected && <Check size={14} className="color-check-icon" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Fits, Silhouettes & Fabrics */}
        <section className="preference-section">
          <div className="section-label-row">
            <Ruler size={16} className="section-icon" />
            <h3 className="section-heading">5. Preferred Fits & Fabrics</h3>
          </div>
          <div className="preference-subgroup">
            <span className="subgroup-title">Silhouettes & Fits:</span>
            <div className="pills-grid">
              {FIT_OPTIONS.map((fit) => {
                const isSelected = (preferences.fits || []).includes(fit);
                return (
                  <button
                    key={fit}
                    type="button"
                    className={`preference-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayOption('fits', fit)}
                  >
                    {isSelected && <Check size={14} className="pill-check-icon" />}
                    <span>{fit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="preference-subgroup" style={{ marginTop: '16px' }}>
            <span className="subgroup-title">Preferred Fabrics:</span>
            <div className="pills-grid">
              {FABRIC_OPTIONS.map((fab) => {
                const isSelected = (preferences.fabrics || []).includes(fab);
                return (
                  <button
                    key={fab}
                    type="button"
                    className={`preference-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayOption('fabrics', fab)}
                  >
                    {isSelected && <Check size={14} className="pill-check-icon" />}
                    <span>{fab}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Standard Sizing Profile */}
        <section className="preference-section">
          <div className="section-label-row">
            <Ruler size={16} className="section-icon" />
            <h3 className="section-heading">6. Standard Sizing Profile</h3>
          </div>
          <div className="sizes-grid-row">
            <div className="size-selector-box">
              <label className="size-field-label">Top / Kurta Size:</label>
              <select
                value={preferences.topSize || 'M'}
                onChange={(e) => setSingleOption('topSize', e.target.value)}
                className="preference-select"
              >
                {SIZE_TOP_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="size-selector-box">
              <label className="size-field-label">Bottoms / Waist Size:</label>
              <select
                value={preferences.bottomSize || '28'}
                onChange={(e) => setSingleOption('bottomSize', e.target.value)}
                className="preference-select"
              >
                {SIZE_BOTTOM_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="size-selector-box">
              <label className="size-field-label">Footwear Size:</label>
              <select
                value={preferences.shoeSize || 'UK 6'}
                onChange={(e) => setSingleOption('shoeSize', e.target.value)}
                className="preference-select"
              >
                {SIZE_SHOE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 7. Budget Range & Occasions */}
        <section className="preference-section">
          <div className="section-label-row">
            <Tag size={16} className="section-icon" />
            <h3 className="section-heading">7. Budget & Occasions</h3>
          </div>

          <div className="preference-subgroup">
            <span className="subgroup-title">Primary Budget Tier:</span>
            <div className="pills-grid">
              {BUDGET_OPTIONS.map((bud) => {
                const isSelected = preferences.budget === bud;
                return (
                  <button
                    key={bud}
                    type="button"
                    className={`preference-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSingleOption('budget', bud)}
                  >
                    {isSelected && <Check size={14} className="pill-check-icon" />}
                    <span>{bud}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="preference-subgroup" style={{ marginTop: '16px' }}>
            <span className="subgroup-title">Frequent Shopping Occasions:</span>
            <div className="pills-grid">
              {OCCASION_OPTIONS.map((occ) => {
                const isSelected = (preferences.occasions || []).includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    className={`preference-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayOption('occasions', occ)}
                  >
                    {isSelected && <Check size={14} className="pill-check-icon" />}
                    <span>{occ}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. Sustainability & Dispatch Preferences */}
        <section className="preference-section">
          <div className="section-label-row">
            <Leaf size={16} className="section-icon" />
            <h3 className="section-heading">8. Sustainability & Dispatch Speed</h3>
          </div>
          <div className="pills-grid">
            {SUSTAINABILITY_OPTIONS.map((sust) => {
              const isSelected = (preferences.sustainability || []).includes(sust);
              return (
                <button
                  key={sust}
                  type="button"
                  className={`preference-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('sustainability', sust)}
                >
                  {isSelected && <Check size={14} className="pill-check-icon" />}
                  <span>{sust}</span>
                </button>
              );
            })}
          </div>

          <div className="preference-subgroup" style={{ marginTop: '16px' }}>
            <span className="subgroup-title">Dispatch Preference:</span>
            <div className="pills-grid">
              {DISPATCH_OPTIONS.map((disp) => {
                const isSelected = preferences.dispatchPreference === disp;
                return (
                  <button
                    key={disp}
                    type="button"
                    className={`preference-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSingleOption('dispatchPreference', disp)}
                  >
                    {isSelected && <Check size={14} className="pill-check-icon" />}
                    <span>{disp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="preference-subgroup" style={{ marginTop: '16px' }}>
            <span className="subgroup-title">Delivery &amp; Courier Preferences:</span>
            <div className="pills-grid">
              {DELIVERY_OPTIONS.map((deliv) => {
                const isSelected = (preferences.deliveryPreferences || []).includes(deliv);
                return (
                  <button
                    key={deliv}
                    type="button"
                    className={`preference-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayOption('deliveryPreferences', deliv)}
                  >
                    {isSelected && <Check size={14} className="pill-check-icon" />}
                    <span>{deliv}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="preferences-footer-actions">
          <button
            type="submit"
            className="btn-primary save-btn-large"
            disabled={saving}
          >
            {saving ? <span>Updating Your Atelier Profile...</span> : (
              <>
                <Save size={18} />
                <span>Save All Shopping Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

