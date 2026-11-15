// src/utils/productCustomization.js
// Generic, catalogue-wide dynamic product customization & colorway resolution helper

import { MOCK_PRODUCTS } from '../data/mockProducts.js';

/**
 * Converts a 3-character or 6-character hex color to { r, g, b }.
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

/**
 * Calculates the perceptual color difference between two hex colors
 * using the Redmean color difference approximation.
 */
export function getColorDistance(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;

  const rMean = (rgb1.r + rgb2.r) / 2;
  const deltaR = rgb1.r - rgb2.r;
  const deltaG = rgb1.g - rgb2.g;
  const deltaB = rgb1.b - rgb2.b;

  const weightR = 2 + rMean / 256;
  const weightG = 4.0;
  const weightB = 2 + (255 - rMean) / 256;

  return (weightR * deltaR * deltaR) + (weightG * deltaG * deltaG) + (weightB * deltaB * deltaB);
}

/**
 * Finds the closest visually similar alternative color variant of the SAME product
 * that has a valid, non-empty, and non-failed image.
 */
export function findClosestAlternativeColor(product, targetColor, excludeColorNames = [], failedUrls = new Set()) {
  if (!product || !product.colorVariants || product.colorVariants.length === 0) {
    return null;
  }

  const targetHex = targetColor?.hex;
  const targetName = targetColor?.name?.toLowerCase();

  // Find all variants of the SAME product that have a valid image
  const candidates = product.colorVariants.filter((v) => {
    if (!v || !v.image || typeof v.image !== 'string' || !v.image.trim()) {
      return false;
    }
    if (v.name && v.name.toLowerCase() === targetName) {
      return false;
    }
    if (excludeColorNames.some((ex) => ex && ex.toLowerCase() === v.name?.toLowerCase())) {
      return false;
    }
    if (failedUrls.has(v.image)) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  // If no target hex is provided, return the first candidate
  if (!targetHex) {
    return candidates[0];
  }

  // Pick the candidate with the minimum perceptual color distance
  let bestCandidate = candidates[0];
  let minDistance = getColorDistance(targetHex, candidates[0].hex);

  for (let i = 1; i < candidates.length; i++) {
    const candidate = candidates[i];
    const dist = getColorDistance(targetHex, candidate.hex);
    if (dist < minDistance) {
      minDistance = dist;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

/**
 * Generates an honest, editorial SVG data URI card for Made-to-Order or custom dye variants,
 * clearly communicating that studio preview photography is unavailable and never reusing an unrelated colour's image.
 */
export function getMadeToOrderCardSvg(product, selectedColor) {
  const title = (product?.name || 'Handcrafted Indian Artisan Piece')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const studio = (product?.artisan?.studio || 'Certified Master Ateliers')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const colorName = (selectedColor?.name || 'Artisan Custom Shade')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const colorHex = selectedColor?.hex || '#2B2B2B';
  const leadTime = (selectedColor?.leadTime || 'Made to Order (7-10 business days)')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700">
    <defs>
      <linearGradient id="mtoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF7F2"/>
        <stop offset="100%" stop-color="#F2EBE0"/>
      </linearGradient>
      <filter id="mtoShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#1A1817" flood-opacity="0.08"/>
      </filter>
    </defs>
    <rect width="600" height="700" fill="url(#mtoBg)"/>
    <rect x="24" y="24" width="552" height="652" rx="16" fill="none" stroke="#E6DCCD" stroke-width="1.5" stroke-dasharray="6,4"/>

    <!-- Badge -->
    <rect x="170" y="56" width="260" height="32" rx="16" fill="#B85834"/>
    <text x="300" y="77" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="#FFFFFF" text-anchor="middle">MADE TO ORDER • COMMISSION</text>

    <!-- Artisanal Color Swatch Disc -->
    <g filter="url(#mtoShadow)">
      <circle cx="300" cy="220" r="88" fill="#FFFFFF"/>
      <circle cx="300" cy="220" r="80" fill="${colorHex}"/>
      <circle cx="300" cy="220" r="80" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.3"/>
    </g>

    <text x="300" y="340" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" letter-spacing="1" fill="#7E746F" text-anchor="middle">AUTHENTIC DYE SWATCH</text>
    <text x="300" y="372" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="bold" fill="#25201E" text-anchor="middle">${colorName}</text>
    <text x="300" y="396" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#998D85" text-anchor="middle">${colorHex.toUpperCase()}</text>

    <!-- Divider -->
    <line x1="160" y1="420" x2="440" y2="420" stroke="#E6DCCD" stroke-width="1"/>

    <!-- Product & Studio Details -->
    <text x="300" y="455" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-style="italic" fill="#25201E" text-anchor="middle">${title.slice(0, 38)}${title.length > 38 ? '...' : ''}</text>
    <text x="300" y="482" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#6A5F59" text-anchor="middle">${studio}</text>

    <!-- Transparent Notice Box -->
    <rect x="70" y="515" width="460" height="74" rx="10" fill="#FFFFFF" stroke="#E6DCCD" stroke-width="1"/>
    <text x="300" y="542" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#B85834" text-anchor="middle">📷 Studio Preview Photo Unavailable</text>
    <text x="300" y="563" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#7E746F" text-anchor="middle">Hand-dyed to order upon commission. An unrelated colour photo is never shown.</text>
    <text x="300" y="579" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#7E746F" text-anchor="middle">Cut &amp; silhouette match the studio model piece.</text>

    <!-- Lead Time Pill -->
    <rect x="180" y="612" width="240" height="30" rx="15" fill="#FAF6EE" stroke="#D1C3B2" stroke-width="1"/>
    <text x="300" y="632" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#4A423D" text-anchor="middle">⏱ ${leadTime}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an elegant SVG data URI fallback for when no suitable bitmap image exists,
 * preventing any broken image icons from ever displaying.
 */
export function getCraftlyFallbackSvg(product, selectedColor) {
  const title = (product?.name || 'Handcrafted Indian Artisan Piece')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const studio = (product?.artisan?.studio || 'Certified Master Ateliers')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const colorName = (selectedColor?.name || 'Artisan Handloom')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const colorHex = selectedColor?.hex || '#B95835';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700">
    <defs>
      <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF7F2"/>
        <stop offset="100%" stop-color="#F3ECE1"/>
      </linearGradient>
    </defs>
    <rect width="600" height="700" fill="url(#cbg)"/>
    <circle cx="300" cy="270" r="96" fill="${colorHex}" opacity="0.12"/>
    <circle cx="300" cy="270" r="72" fill="${colorHex}" opacity="0.28"/>
    <circle cx="300" cy="270" r="48" fill="${colorHex}"/>
    <text x="300" y="420" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#25201E" text-anchor="middle">${title.slice(0, 36)}${title.length > 36 ? '...' : ''}</text>
    <text x="300" y="455" font-family="sans-serif" font-size="14" fill="#7E746F" text-anchor="middle">${studio}</text>
    <rect x="180" y="490" width="240" height="34" rx="17" fill="#FFFFFF" stroke="#E6DCCD" stroke-width="1.5"/>
    <text x="300" y="512" font-family="sans-serif" font-size="12" font-weight="600" fill="#B95835" text-anchor="middle">Artisan Shade: ${colorName}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Resolves a color variant object from a product and either a color object or color name string.
 */
export function resolveProductColor(product, colorOrName) {
  if (!product) return null;
  const variants = product.colorVariants || [];
  if (!variants.length) {
    return {
      id: `${product.id}-default`,
      name: 'Standard Shade',
      hex: '#FAF6EE',
      image: product.image,
      inStock: true,
      isMadeToOrder: false,
      isPhotographedSample: true,
      stockQuantity: 20,
      leadTime: product.leadTime || 'Ready to ship',
    };
  }

  if (!colorOrName) {
    return variants[0];
  }

  if (typeof colorOrName === 'object' && colorOrName !== null) {
    if (colorOrName.id) {
      const byId = variants.find((v) => v.id === colorOrName.id);
      if (byId) return byId;
    }
    if (colorOrName.name) {
      const byName = variants.find((v) => v.name.toLowerCase() === colorOrName.name.toLowerCase());
      if (byName) return byName;
    }
  }

  if (typeof colorOrName === 'string') {
    const byId = variants.find((v) => v.id === colorOrName);
    if (byId) return byId;
    const byName = variants.find((v) => v.name.toLowerCase() === colorOrName.toLowerCase());
    if (byName) return byName;
  }

  return variants[0];
}

/**
 * Master resolution function for colorway images:
 * - A selectable colour must represent a genuinely supported product variant.
 * - Each variant must have its own correct image if an image preview is advertised.
 * - Never reuse another colour's image as if it were the selected colour.
 * - If a colour is supported only as made-to-order, label it clearly and do not pretend an accurate preview exists.
 */
export function resolveColorwayImage(product, selectedColor, options = {}) {
  const { failedUrls = new Set() } = options;

  if (!product) {
    return {
      src: '',
      isAlternative: false,
      alternativeColor: null,
      isDedicated: false,
      isFallback: false,
      isMadeToOrder: false,
      previewAvailable: false,
      selectedColor: null,
    };
  }

  // Look up fresh catalogue product by ID to ensure latest data
  const catalogProduct = MOCK_PRODUCTS.find((p) => p.id === product.id) || product;
  const resolvedColor = resolveProductColor(catalogProduct, selectedColor);

  // 1. Check if selected color is Made-to-Order or has no photographed sample
  // NEVER reuse another colour's image as if it were the selected colour!
  if (resolvedColor?.isMadeToOrder || !resolvedColor?.image) {
    return {
      src: getMadeToOrderCardSvg(catalogProduct, resolvedColor),
      isAlternative: false,
      alternativeColor: null,
      isDedicated: false,
      isFallback: false,
      isMadeToOrder: true,
      previewAvailable: false,
      selectedColor: resolvedColor,
    };
  }

  // 2. Check if selected color has a dedicated, genuine studio image
  const dedicatedImage = resolvedColor?.image;
  if (
    dedicatedImage &&
    typeof dedicatedImage === 'string' &&
    dedicatedImage.trim() !== '' &&
    !failedUrls.has(dedicatedImage)
  ) {
    return {
      src: dedicatedImage,
      isAlternative: false,
      alternativeColor: null,
      isDedicated: true,
      isFallback: false,
      isMadeToOrder: false,
      previewAvailable: true,
      selectedColor: resolvedColor,
    };
  }

  // 3. Graceful SVG fallback only if the dedicated image failed to load
  return {
    src: getCraftlyFallbackSvg(catalogProduct, resolvedColor),
    isAlternative: false,
    alternativeColor: null,
    isDedicated: false,
    isFallback: true,
    isMadeToOrder: Boolean(resolvedColor?.isMadeToOrder),
    previewAvailable: false,
    selectedColor: resolvedColor,
  };
}

/**
 * Universally retrieves the preview image URL for any product and selected color.
 * Works uniformly across ProductCard, QuickViewModal, HeroCustomizer, CartDrawer, and Wishlist.
 */
export function getProductPreviewImage(product, selectedColor, options = {}) {
  const result = resolveColorwayImage(product, selectedColor, options);
  return result.src;
}

/**
 * Checks whether the selected color has a dedicated, matching studio photograph of the same garment.
 */
export function hasDistinctColorwayImage(product, selectedColor) {
  if (!product || !selectedColor) return false;
  const catalogProduct = MOCK_PRODUCTS.find((p) => p.id === product.id) || product;
  const resolvedColor = resolveProductColor(catalogProduct, selectedColor);
  if (!resolvedColor || resolvedColor.isMadeToOrder || !resolvedColor.image) return false;
  return Boolean(resolvedColor.image && resolvedColor.isPhotographedSample !== false);
}
