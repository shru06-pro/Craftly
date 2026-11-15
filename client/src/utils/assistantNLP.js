// src/utils/assistantNLP.js
import { MOCK_PRODUCTS, SHOP_THE_LOOKS } from '../data/mockProducts.js';

/**
 * Intelligent fashion & craft assistant parser for Craftly.
 * Handles Indian women's fashion (Western, Ethnic, Indo-Western, Footwear, Bags, Jewellery).
 * Understands:
 * - College outfits under ₹1,000 / ₹1,500
 * - Tops to match wide-leg jeans
 * - Office / workwear outfits
 * - Affordable festive outfits
 * - Indo-Western looks & fusion styling
 * - Outfit suggestions based on customer preferences
 * - Similar products within budget
 */
export function parseShoppingQuery(query, userPreferences = null) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      text: "Namaste! I am your Craftly Stylist & Craft Advisor. Looking for college fits under ₹1,000, office chic, an Indo-Western fusion look, or tops for wide-leg jeans? Ask me anything!",
      products: [],
      suggestedPrompts: [
        "Suggest college outfits under ₹1,000",
        "Find tops that match wide-leg jeans",
        "Recommend office outfits",
        "Suggest affordable festive outfits",
        "Create an Indo-Western look",
      ],
    };
  }

  // Clean query and normalize numbers like "1,000" -> "1000"
  const normalized = query.toLowerCase().replace(/[,]/g, '').trim();

  // 1. Greetings
  const isGreeting = /^(hi|hello|hey|namaste|greetings|good (morning|afternoon|evening))\b/i.test(normalized);
  if (isGreeting && normalized.length < 35) {
    return {
      text: "Namaste! Welcome to Craftly—India's Women's Fashion & Lifestyle Marketplace. I am your personal stylist. I can help you curate complete looks, pair Western and Indian pieces, find college staples on a budget, or style handlooms for work and festivities. What are you looking to wear today?",
      products: [],
      suggestedPrompts: [
        "Suggest college outfits under ₹1,000",
        "Find tops that match wide-leg jeans",
        "Recommend office outfits",
        "Create an Indo-Western look",
      ],
    };
  }

  // 2. "Suggest college outfits under ₹1,000 / ₹1,500"
  if (
    (normalized.includes('college') || normalized.includes('campus')) &&
    (normalized.includes('1000') || normalized.includes('1500') || normalized.includes('budget') || normalized.includes('cheap') || normalized.includes('affordable'))
  ) {
    const collegePicks = MOCK_PRODUCTS.filter(
      (p) =>
        p.id === 'prod-b2' || // College Canvas Tote (₹799)
        p.id === 'prod-j1' || // Silver Peacock Jhumkas (₹899)
        p.id === 'prod-w1' || // Oversized Khadi Shirt (₹1299)
        p.id === 'prod-f1'    // Kolhapuri Flats (₹1299)
    );
    return {
      text: "Here is our curated **Campus Style Under ₹1,500**! For long college days in the Indian climate, pair a breathable organic khadi boyfriend shirt with an everyday canvas laptop tote and comfortable agave-stitched Kolhapuris. Add oxidized silver jhumkas for instant Indo-Western flair:\n\n✨ **Styling Tip:** Half-tuck the boyfriend shirt into high-waist jeans and roll the sleeves twice for that effortless 'Clean Girl' campus aesthetic.",
      products: collegePicks,
      suggestedPrompts: [
        "Find tops that match wide-leg jeans",
        "Suggest affordable festive outfits",
        "Create an Indo-Western look",
      ],
    };
  }

  // 3. "Find tops that match wide-leg jeans"
  if (
    (normalized.includes('top') || normalized.includes('tops') || normalized.includes('shirt') || normalized.includes('kurta')) &&
    (normalized.includes('wide-leg') || normalized.includes('wide leg') || normalized.includes('mom jean') || normalized.includes('baggy') || normalized.includes('denim'))
  ) {
    const topsMatchingWideLeg = MOCK_PRODUCTS.filter(
      (p) =>
        p.id === 'prod-w1' || // Oversized Khadi Boyfriend Shirt
        p.id === 'prod-1'  || // Hand-Embroidered Chikankari Kurta
        p.id === 'prod-iw2'   // Kalamkari Bustier
    );
    return {
      text: "Wide-leg and baggy denims look incredible with two distinct proportions:\n\n1. **Structured Contrast:** A boned Kalamkari crop bustier balances the volume of the wide leg.\n2. **Effortless Drape:** An oversized khadi shirt worn unbuttoned over a ribbed tank, or our featherweight mulmul Chikankari kurta with folded cuffs for an effortless Indo-Western college vibe.\n\nHere are our top recommended pairings for wide-leg jeans:",
      products: topsMatchingWideLeg,
      suggestedPrompts: [
        "Recommend office outfits",
        "Create an Indo-Western look",
        "Suggest college outfits under ₹1,000",
      ],
    };
  }

  // 4. "Recommend office outfits" / workwear
  if (
    normalized.includes('office') ||
    normalized.includes('work') ||
    normalized.includes('workwear') ||
    normalized.includes('corporate') ||
    normalized.includes('meeting')
  ) {
    const officeEnsemble = MOCK_PRODUCTS.filter(
      (p) =>
        p.id === 'prod-w4' || // Linen Blazer
        p.id === 'prod-b1' || // Santiniketan Leather Tote
        p.id === 'prod-j2' || // Baroque Pearl Huggies
        p.id === 'prod-w1'    // Khadi Boyfriend Shirt
    );
    return {
      text: "For modern Indian workplaces, comfort meets sharp sophistication with our **Minimalist Workwear Edit**. A breathable double-breasted khadi linen blazer over tailored trousers, finished with a vegetable-tanned Santiniketan leather laptop tote and dainty freshwater baroque pearl huggies:\n\n💼 **Styling Note:** Pure linen keeps you cool during commutes while providing a tailored structure in air-conditioned conference rooms.",
      products: officeEnsemble,
      suggestedPrompts: [
        "Find tops that match wide-leg jeans",
        "Suggest affordable festive outfits",
        "Create an Indo-Western look",
      ],
    };
  }

  // 5. "Suggest affordable festive outfits" / weddings
  if (
    normalized.includes('festive') ||
    normalized.includes('wedding') ||
    normalized.includes('sangeet') ||
    normalized.includes('mehendi') ||
    normalized.includes('diwali') ||
    normalized.includes('puja')
  ) {
    const festivePicks = MOCK_PRODUCTS.filter(
      (p) =>
        p.id === 'prod-iw1' || // Asymmetric Cape Dhoti Set
        p.id === 'prod-4'   || // Meenakari Kundan Choker
        p.id === 'prod-e2'  || // Banarasi Saree
        p.id === 'prod-f2'     // Zardozi Juttis
    );
    return {
      text: "Celebrate in authentic Indian grandeur without heavy synthetic fabrics! Our festive collection spotlights real handlooms and heritage embroidery:\n\n✨ **Option A (Contemporary):** The Asymmetric Dabu block-printed cape & dhoti set (₹2,999) with silver jhumkas.\n✨ **Option B (Classic Heirlooms):** Pure Banarasi Katan silk saree woven in Varanasi paired with flame-chased Meenakari & Kundan choker.\n\nExplore our festive favorites:",
      products: festivePicks,
      suggestedPrompts: [
        "Create an Indo-Western look",
        "Suggest college outfits under ₹1,000",
        "Recommend office outfits",
      ],
    };
  }

  // 6. "Create an Indo-Western look" / fusion
  if (
    normalized.includes('indo-western') ||
    normalized.includes('indo western') ||
    normalized.includes('fusion') ||
    normalized.includes('contemporary ethnic')
  ) {
    const indoWesternPicks = MOCK_PRODUCTS.filter(
      (p) =>
        p.id === 'prod-iw1' || // Cape Dhoti Set
        p.id === 'prod-1'   || // Chikankari Kurta (styled with jeans)
        p.id === 'prod-j1'  || // Silver Peacock Jhumka
        p.id === 'prod-b3'     // Saddle Sling Bag
    );
    return {
      text: "Indo-Western fusion is Craftly's specialty! You can effortlessly blend Indian artisanal techniques with Western silhouettes:\n\n1. **The Modern Dhoti:** Flowing asymmetric chiffon cape paired with satin dhoti trousers and minimal metallic accents.\n2. **The Denim Kurti:** A pristine white mulmul Chikankari kurta tucked into wide-leg vintage raw denim with oxidized peacock jhumkas and a tan leather crossbody sling.\n\nHere are the signature pieces to create this look:",
      products: indoWesternPicks,
      suggestedPrompts: [
        "Find tops that match wide-leg jeans",
        "Suggest college outfits under ₹1,000",
        "Recommend office outfits",
      ],
    };
  }

  // 7. "Recommend outfits based on my preferences"
  if (
    normalized.includes('preference') ||
    normalized.includes('my profile') ||
    normalized.includes('recommend for me') ||
    normalized.includes('personalize')
  ) {
    let personalizedPicks = [];
    if (userPreferences) {
      const aesthetics = Array.isArray(userPreferences.aesthetics)
        ? userPreferences.aesthetics
        : userPreferences.aesthetic
        ? [userPreferences.aesthetic]
        : [];
      const dept = userPreferences.department;
      
      personalizedPicks = MOCK_PRODUCTS.filter((p) => {
        if (aesthetics.length > 0 && p.aestheticTag && aesthetics.includes(p.aestheticTag)) return true;
        if (dept && p.category === dept) return true;
        return false;
      });
    }
    if (!personalizedPicks.length) {
      personalizedPicks = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[4], MOCK_PRODUCTS[8]];
    }
    return {
      text: "I reviewed your style preferences! Based on your preferred aesthetic, occasion, and sizing parameters, here are your personalized fashion recommendations curated from our artisan boutiques:",
      products: personalizedPicks.slice(0, 6),
      suggestedPrompts: [
        "Suggest college outfits under ₹1,000",
        "Find tops that match wide-leg jeans",
        "Create an Indo-Western look",
      ],
    };
  }

  // 8. "Find similar products within my budget"
  if (
    normalized.includes('within my budget') ||
    normalized.includes('similar products within') ||
    normalized.includes('similar items within') ||
    normalized.includes('in my budget')
  ) {
    const budgetLimit = userPreferences?.budgetTier === 'premium' ? 8000 : userPreferences?.budgetTier === 'mid-range' ? 3500 : 2000;
    const budgetPicks = MOCK_PRODUCTS.filter((p) => p.price <= budgetLimit).slice(0, 5);
    return {
      text: `Based on your budget preference (up to ₹${budgetLimit.toLocaleString('en-IN')}), here are matching curated pieces from our independent boutiques and handcrafted ateliers:`,
      products: budgetPicks,
      suggestedPrompts: [
        "Suggest college outfits under ₹1,000",
        "Find tops that match wide-leg jeans",
        "Recommend office outfits",
      ],
    };
  }

  // 9. Extract Budget / Price Filters
  let maxPrice = null;
  const priceRegex = /(?:under|below|less than|max|cheaper than|budget(?: of)?|<)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i;
  const priceMatch = normalized.match(priceRegex);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // 10. Extract Category / Style Filters
  let categoryFilter = null;
  if (normalized.includes('western') || normalized.includes('crop top') || normalized.includes('t-shirt') || normalized.includes('tee') || normalized.includes('jean') || normalized.includes('cargo') || normalized.includes('blazer')) {
    categoryFilter = 'western';
  } else if (normalized.includes('ethnic') || normalized.includes('kurta') || normalized.includes('kurti') || normalized.includes('saree') || normalized.includes('lehenga') || normalized.includes('anarkali') || normalized.includes('chikankari')) {
    categoryFilter = 'ethnic';
  } else if (normalized.includes('bag') || normalized.includes('tote') || normalized.includes('sling') || normalized.includes('leather')) {
    categoryFilter = 'bags-accessories';
  } else if (normalized.includes('shoe') || normalized.includes('footwear') || normalized.includes('kolhapuri') || normalized.includes('jutti') || normalized.includes('flat')) {
    categoryFilter = 'footwear';
  } else if (normalized.includes('jewelry') || normalized.includes('jewellery') || normalized.includes('earring') || normalized.includes('jhumka') || normalized.includes('choker') || normalized.includes('pearl')) {
    categoryFilter = 'jewelry';
  } else if (normalized.includes('beauty') || normalized.includes('skin') || normalized.includes('mist') || normalized.includes('oil')) {
    categoryFilter = 'beauty';
  } else if (normalized.includes('home') || normalized.includes('pottery') || normalized.includes('cup') || normalized.includes('cushion')) {
    categoryFilter = 'home';
  }

  // 10. Dynamic filtering across full catalogue
  const filtered = MOCK_PRODUCTS.filter((product) => {
    if (maxPrice !== null && product.price > maxPrice) return false;
    if (categoryFilter && product.category !== categoryFilter) return false;

    // keyword match
    if (normalized.includes('indigo') && !product.colorVariants?.some((c) => c.name.toLowerCase().includes('indigo'))) return false;
    if (normalized.includes('white') && !product.colorVariants?.some((c) => c.name.toLowerCase().includes('white') || c.name.toLowerCase().includes('ivory'))) return false;

    return true;
  });

  if (filtered.length > 0) {
    const summaryParts = [];
    if (categoryFilter) summaryParts.push(categoryFilter);
    if (maxPrice !== null) summaryParts.push(`under ₹${maxPrice}`);

    return {
      text: `Here are our verified creations matching your search ${summaryParts.join(' ')}:`,
      products: filtered,
      suggestedPrompts: [
        "Suggest college outfits under ₹1,000",
        "Find tops that match wide-leg jeans",
        "Create an Indo-Western look",
      ],
    };
  }

  // Fallback
  return {
    text: `I couldn't find exact matches for "${query}", but here are our current top-trending Indian fashion & handcrafted staples loved by college and working women across India:`,
    products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[4], MOCK_PRODUCTS[7]],
    suggestedPrompts: [
      "Suggest college outfits under ₹1,000",
      "Find tops that match wide-leg jeans",
      "Recommend office outfits",
      "Create an Indo-Western look",
    ],
  };
}
