// src/utils/productCustomization.js
// Generic, catalogue-wide dynamic product customization & colorway resolution helper

import { MOCK_PRODUCTS } from '../data/mockProducts';

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
      name: 'Standard Shade',
      hex: '#FAF6EE',
      image: product.image,
      isPhotographedSample: true,
    };
  }

  if (!colorOrName) {
    return variants[0];
  }

  const nameToMatch = typeof colorOrName === 'string' ? colorOrName : colorOrName.name;
  if (!nameToMatch) return variants[0];

  const found = variants.find(
    (v) => v.name.toLowerCase() === nameToMatch.toLowerCase()
  );

  return found || variants[0];
}

/**
 * Master resolution function for colorway images:
 * 1. Returns dedicated image if available and not failed
 * 2. If dedicated image unavailable or failed, returns closest visually similar available colour of the SAME product
 * 3. If no alternative variant has an image, falls back to base product image
 * 4. If base image fails, retains current working image
 * 5. If everything fails, returns graceful SVG data URI fallback
 */
export function resolveColorwayImage(product, selectedColor, options = {}) {
  const { currentImage, failedUrls = new Set(), excludeColors = [] } = options;

  if (!product) {
    return {
      src: '',
      isAlternative: false,
      alternativeColor: null,
      isDedicated: false,
      isFallback: false,
      selectedColor: null,
    };
  }

  // Look up fresh catalogue product by ID to ensure latest data
  const catalogProduct = MOCK_PRODUCTS.find((p) => p.id === product.id) || product;
  const resolvedColor = resolveProductColor(catalogProduct, selectedColor);

  // 1. Check if selected color has a valid dedicated image
  const dedicatedImage = resolvedColor?.image;
  const hasDedicated = Boolean(
    dedicatedImage &&
    typeof dedicatedImage === 'string' &&
    dedicatedImage.trim() !== '' &&
    !failedUrls.has(dedicatedImage)
  );

  if (hasDedicated) {
    return {
      src: dedicatedImage,
      isAlternative: false,
      alternativeColor: null,
      isDedicated: true,
      isFallback: false,
      selectedColor: resolvedColor,
    };
  }

  // 2. Selected color has no image or its image failed:
  // Find the closest visually similar available colour of the SAME product
  const closestVariant = findClosestAlternativeColor(
    catalogProduct,
    resolvedColor,
    [resolvedColor?.name, ...excludeColors],
    failedUrls
  );

  if (closestVariant?.image && !failedUrls.has(closestVariant.image)) {
    return {
      src: closestVariant.image,
      isAlternative: true,
      alternativeColor: closestVariant,
      isDedicated: false,
      isFallback: false,
      selectedColor: resolvedColor,
    };
  }

  // 3. Fallback to base product image if valid and not failed
  const baseImage = catalogProduct.image || product.image;
  if (baseImage && typeof baseImage === 'string' && baseImage.trim() !== '' && !failedUrls.has(baseImage)) {
    return {
      src: baseImage,
      isAlternative: true,
      alternativeColor: catalogProduct.colorVariants?.[0] || null,
      isDedicated: false,
      isFallback: false,
      selectedColor: resolvedColor,
    };
  }

  // 4. Retain current working image if provided and not failed
  if (currentImage && typeof currentImage === 'string' && currentImage.trim() !== '' && !failedUrls.has(currentImage)) {
    return {
      src: currentImage,
      isAlternative: true,
      alternativeColor: null,
      isDedicated: false,
      isFallback: false,
      selectedColor: resolvedColor,
    };
  }

  // 5. Graceful SVG fallback (never broken image)
  return {
    src: getCraftlyFallbackSvg(catalogProduct, resolvedColor),
    isAlternative: true,
    alternativeColor: null,
    isDedicated: false,
    isFallback: true,
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
 * Checks whether the selected color has a dedicated, matching studio photograph.
 */
export function hasDistinctColorwayImage(product, selectedColor) {
  if (!product || !selectedColor) return false;
  const result = resolveColorwayImage(product, selectedColor);
  return result.isDedicated && !result.isAlternative && !result.isFallback;
}
