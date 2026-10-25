// src/utils/assistantNLP.js
import { MOCK_PRODUCTS } from '../data/mockProducts.js';

/**
 * Intelligent rule-based natural language parser for Craftly shopping queries.
 * Accurately extracts: budget/maximum price in INR, category, color, occasion, craft keywords, and sizing.
 * Relies strictly on authentic MOCK_PRODUCTS data without inventing products or specs.
 */
export function parseShoppingQuery(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      text: "Namaste! I am your Craftly Craft Advisor. How may I assist your craft journey today?",
      products: [],
      suggestedPrompts: [
        "Show me kurtas under ₹1000",
        "Find products in indigo",
        "Suggest an outfit for a wedding",
        "Show me handmade products",
        "Help me choose a size",
      ],
    };
  }

  const normalized = query.toLowerCase().trim();

  // 1. Check for Greetings
  const isGreeting = /^(hi|hello|hey|namaste|greetings|good (morning|afternoon|evening))\b/i.test(normalized);
  if (isGreeting && normalized.length < 35) {
    return {
      text: "Namaste! Welcome to Craftly. I am your Craft Advisor. I can help you discover authentic handcrafted Indian pieces, suggest festive outfits, find specific colors or craft techniques, check sizing, or filter by budget. How can I assist you today?",
      products: [],
      suggestedPrompts: [
        "Show me kurtas under ₹1000",
        "Find products in indigo",
        "Suggest an outfit for a wedding",
        "Help me choose a size",
      ],
    };
  }

  // 2. Check for queries asking for non-existent / fictional items
  if (
    normalized.includes('not exist') ||
    normalized.includes("doesn't exist") ||
    normalized.includes("don't exist") ||
    normalized.includes('fake') ||
    normalized.includes('fictional') ||
    normalized.includes('invent')
  ) {
    return {
      text: "Craftly strictly features genuine, authentic creations crafted by verified Indian master artisans. We do not list or invent fictional products, unverified stock, or mass-produced commercial goods. You can explore all 8 verified heirloom pieces in our curated catalogue:",
      products: [],
      suggestedPrompts: [
        "Show me handmade products",
        "Find products in indigo",
        "Suggest an outfit for a wedding",
      ],
    };
  }

  // 3. Check for Sizing & Fit Intent
  const hasFitWord = /\bfit\b|\bfits\b|\bfitting\b/.test(normalized);
  if (
    normalized.includes('size') ||
    normalized.includes('sizing') ||
    hasFitWord ||
    normalized.includes('measurement') ||
    normalized.includes('measurements') ||
    normalized.includes('bust') ||
    normalized.includes('waist') ||
    normalized.includes('tailor') ||
    normalized.includes('custom fit')
  ) {
    const customizableApparel = MOCK_PRODUCTS.filter((p) => p.allowsCustomMeasurements);
    return {
      text: "We make finding the right fit effortless and personal! Craftly offers two sizing options:\n\n1. Standard Sizing (XS to XXL): Carefully graded according to standard Indian size charts.\n2. Bespoke Made-to-Measure Tailoring: Master artisans like Begum Naseem Akhtar and Devendra Ansari customize tunic length, sleeve length, bust, and waist dimensions to your exact inches.\n\nHere are our custom-tailored apparel pieces—click any piece to tailor your measurements:",
      products: customizableApparel,
      suggestedPrompts: [
        "Suggest an outfit for a wedding",
        "Find products in indigo",
        "Show me handmade products",
      ],
    };
  }

  // 4. Check for "Handmade" / "Artisan" / "Craft" Intent
  if (
    normalized.includes('handmade') ||
    normalized.includes('handcrafted') ||
    normalized.includes('artisan') ||
    normalized.includes('who makes') ||
    normalized.includes('maker') ||
    (normalized.includes('craft') && !normalized.includes('craftly'))
  ) {
    return {
      text: "Every single piece on Craftly is 100% handcrafted by certified generational artisans across India—from Lucknow's 32-stitch Chikankari embroiderers to Bagru mud-resist block printers and Santiniketan leather masters. Over 85% of proceeds go directly to artisan guilds with zero factory middlemen.\n\nHere is a curated showcase representing our verified artisan clusters:",
      products: [
        MOCK_PRODUCTS[0], // Chikankari Kurta (Lucknow)
        MOCK_PRODUCTS[1], // Bagru Dress (Jaipur)
        MOCK_PRODUCTS[2], // Santiniketan Tote (Bengal)
        MOCK_PRODUCTS[3], // Meenakari Choker (Jaipur)
        MOCK_PRODUCTS[4], // Kantha Stole (Santiniketan)
        MOCK_PRODUCTS[7], // Khurja Kulhar (Uttar Pradesh)
      ],
      suggestedPrompts: [
        "Show me kurtas under ₹1000",
        "Find products in indigo",
        "Suggest an outfit for a wedding",
      ],
    };
  }

  // 5. Extract Budget / Price Filters
  // Examples: "under 1000", "under ₹1000", "below 1500", "less than 2000", "budget 3000"
  let maxPrice = null;
  const priceRegex = /(?:under|below|less than|max|cheaper than|budget(?: of)?|<)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i;
  const priceMatch = normalized.match(priceRegex);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // 6. Extract Category / Item Filters
  let categoryFilter = null;
  let isKurtaQuery = false;
  let isDressQuery = false;
  let isLeatherQuery = false;
  let isJewelryQuery = false;
  let isStoleQuery = false;
  let isPotteryQuery = false;
  let isFootwearQuery = false;

  if (normalized.includes('kurta') || normalized.includes('kurtas') || normalized.includes('kurti')) {
    isKurtaQuery = true;
    categoryFilter = 'apparel';
  } else if (normalized.includes('dress') || normalized.includes('dresses') || normalized.includes('co-ord') || normalized.includes('coord')) {
    isDressQuery = true;
    categoryFilter = 'apparel';
  } else if (normalized.includes('apparel') || normalized.includes('clothing') || normalized.includes('outfit')) {
    categoryFilter = 'apparel';
  } else if (normalized.includes('leather') || normalized.includes('tote') || normalized.includes('bag') || normalized.includes('handbag')) {
    isLeatherQuery = true;
    categoryFilter = 'leather';
  } else if (normalized.includes('jewelry') || normalized.includes('jewellery') || normalized.includes('choker') || normalized.includes('necklace') || normalized.includes('kundan') || normalized.includes('meenakari')) {
    isJewelryQuery = true;
    categoryFilter = 'jewelry';
  } else if (normalized.includes('stole') || normalized.includes('dupatta') || normalized.includes('scarf') || normalized.includes('kantha') || normalized.includes('shawl')) {
    isStoleQuery = true;
    categoryFilter = 'accessories';
  } else if (normalized.includes('pottery') || normalized.includes('kulhar') || normalized.includes('chai') || normalized.includes('cup') || normalized.includes('cups') || normalized.includes('ceramic') || normalized.includes('home')) {
    isPotteryQuery = true;
    categoryFilter = 'home';
  } else if (normalized.includes('mojari') || normalized.includes('mojaris') || normalized.includes('jutti') || normalized.includes('shoes') || normalized.includes('footwear') || normalized.includes('kolhapuri')) {
    isFootwearQuery = true;
    categoryFilter = 'accessories';
  }

  // 7. Extract Color Filters
  let colorFilter = null;
  const colors = [
    { name: 'Indigo', keywords: ['indigo', 'neel', 'blue', 'cobalt'] },
    { name: 'Terracotta', keywords: ['rust', 'terracotta', 'madder', 'maroon', 'red'] },
    { name: 'Sage', keywords: ['sage', 'green', 'olive', 'pistachio'] },
    { name: 'Ivory', keywords: ['ivory', 'white', 'sand', 'cream'] },
    { name: 'Gold', keywords: ['gold', 'golden', 'zari'] },
    { name: 'Silver', keywords: ['silver', 'oxide'] },
    { name: 'Mustard', keywords: ['mustard', 'haldi', 'yellow'] },
    { name: 'Cognac', keywords: ['cognac', 'espresso', 'tan', 'brown'] },
  ];

  for (const c of colors) {
    if (c.keywords.some((k) => normalized.includes(k))) {
      colorFilter = c;
      break;
    }
  }

  // 8. Extract Occasion Filters
  const isFestiveOrWedding =
    normalized.includes('wedding') ||
    normalized.includes('shaadi') ||
    normalized.includes('sangeet') ||
    normalized.includes('festive') ||
    normalized.includes('festival') ||
    normalized.includes('celebration') ||
    normalized.includes('party');

  const isDaily =
    normalized.includes('daily') ||
    normalized.includes('everyday') ||
    normalized.includes('office') ||
    normalized.includes('casual') ||
    normalized.includes('summer');

  const isGifting =
    normalized.includes('gift') ||
    normalized.includes('gifting') ||
    normalized.includes('present');

  // Handle specific query: "Show me kurtas under ₹1000"
  if (isKurtaQuery && maxPrice !== null && maxPrice <= 1000) {
    const kurta = MOCK_PRODUCTS.find((p) => p.id === 'prod-1');
    const budgetItems = MOCK_PRODUCTS.filter((p) => p.price <= 1500);
    return {
      text: "Our authentic hand-embroidered Chikankari kurtas start at ₹2,499. Each kurta takes 15–20 days of hand-embroidery with 32 authentic Lucknowi stitches (Murri, Phanda, Keel Kangan) by master artisans like Begum Naseem Akhtar, guaranteeing fair ethical wages with zero mass-factory compromises.\n\nWhile we don't have kurtas under ₹1,000, here is our signature Chikankari Kurta alongside authentic handcrafted artisan pieces under ₹1,500:",
      products: [kurta, ...budgetItems].filter(Boolean),
      suggestedPrompts: [
        "Find products in indigo",
        "Suggest an outfit for a wedding",
        "Help me choose a size",
      ],
    };
  }

  // Handle Wedding / Festive query
  if (isFestiveOrWedding) {
    const festiveItems = [
      MOCK_PRODUCTS.find((p) => p.id === 'prod-6'), // Maheshwari Co-ord with Zari
      MOCK_PRODUCTS.find((p) => p.id === 'prod-4'), // Meenakari & Kundan Choker
      MOCK_PRODUCTS.find((p) => p.id === 'prod-1'), // Chikankari Kurta
      MOCK_PRODUCTS.find((p) => p.id === 'prod-5'), // Kantha Tussar Silk Stole
    ].filter(Boolean);

    return {
      text: "For festive occasions, weddings, and celebration gatherings, here is an authentic heirloom ensemble curated from India's master weavers. Pair the Maheshwari handloom silk-cotton co-ord with subtle gold zari borders alongside our flame-chased Meenakari & Kundan choker or a wild Tussar silk Kantha stole:",
      products: festiveItems,
      suggestedPrompts: [
        "Find products in indigo",
        "Show me kurtas under ₹1000",
        "Help me choose a size",
      ],
    };
  }

  // Handle Gifting query
  if (isGifting) {
    const giftItems = [
      MOCK_PRODUCTS.find((p) => p.id === 'prod-3'), // Monogram Leather Tote
      MOCK_PRODUCTS.find((p) => p.id === 'prod-5'), // Kantha Silk Stole with initial
      MOCK_PRODUCTS.find((p) => p.id === 'prod-8'), // Khurja Chai Kulhar Set
      MOCK_PRODUCTS.find((p) => p.id === 'prod-4'), // Meenakari Choker
    ].filter(Boolean);

    return {
      text: "Craftly heirloom pieces make meaningful, personalized gifts crafted to endure generations. Our Santiniketan leather totes and Kantha stoles include personalized hand-embossed initials:",
      products: giftItems,
      suggestedPrompts: [
        "Find products in indigo",
        "Suggest an outfit for a wedding",
        "Show me handmade products",
      ],
    };
  }

  // Handle Daily / Casual wear query
  if (isDaily) {
    const dailyItems = [
      MOCK_PRODUCTS.find((p) => p.id === 'prod-2'), // Bagru Dress
      MOCK_PRODUCTS.find((p) => p.id === 'prod-1'), // Chikankari Kurta
      MOCK_PRODUCTS.find((p) => p.id === 'prod-7'), // Kolhapuri Mojaris
    ].filter(Boolean);

    return {
      text: "For breathable, stylish everyday comfort, our artisanal block-printed Bagru dresses, handloom muslin Chikankari kurtas, and handcrafted Kolhapuri mojaris offer natural comfort made with plant dyes and 100% pure cotton:",
      products: dailyItems,
      suggestedPrompts: [
        "Find products in indigo",
        "Help me choose a size",
        "Show me handmade products",
      ],
    };
  }

  // Dynamic Filtering based on extracted parameters
  const filtered = MOCK_PRODUCTS.filter((product) => {
    // Price filter
    if (maxPrice !== null && product.price > maxPrice) {
      return false;
    }

    // Category / Item filter
    if (isKurtaQuery && product.id !== 'prod-1') return false;
    if (isDressQuery && product.id !== 'prod-2' && product.id !== 'prod-6') return false;
    if (isLeatherQuery && product.category !== 'leather') return false;
    if (isJewelryQuery && product.category !== 'jewelry') return false;
    if (isStoleQuery && product.id !== 'prod-5') return false;
    if (isPotteryQuery && product.category !== 'home') return false;
    if (isFootwearQuery && product.id !== 'prod-7') return false;
    if (categoryFilter && !isKurtaQuery && !isDressQuery && !isLeatherQuery && !isJewelryQuery && !isStoleQuery && !isPotteryQuery && !isFootwearQuery) {
      if (product.category !== categoryFilter) return false;
    }

    // Color filter
    if (colorFilter) {
      const hasColor = product.colorVariants?.some((v) =>
        colorFilter.keywords.some((k) => v.name.toLowerCase().includes(k))
      );
      if (!hasColor) return false;
    }

    return true;
  });

  // If specific filters yielded results
  if (filtered.length > 0) {
    const summaryParts = [];
    if (colorFilter) summaryParts.push(`${colorFilter.name}`);
    if (categoryFilter) summaryParts.push(`${categoryFilter}`);
    if (maxPrice !== null) summaryParts.push(`under ₹${maxPrice}`);

    const desc = summaryParts.length > 0
      ? `Here are our authentic artisan creations matching ${summaryParts.join(' ')}:`
      : `Here are our recommended handcrafted pieces:`;

    return {
      text: desc,
      products: filtered,
      suggestedPrompts: [
        "Suggest an outfit for a wedding",
        "Help me choose a size",
        "Show me handmade products",
      ],
    };
  }

  // Fallback if no exact match found
  return {
    text: `We currently do not have handcrafted artisan pieces matching "${query}" in our verified catalogue. Craftly exclusively showcases authentic Indian handlooms, vegetable-tanned leather, Kundan jewellery, and studio pottery. Would you like to explore one of these craft collections instead?`,
    products: [],
    suggestedPrompts: [
      "Show me handmade products",
      "Find products in indigo",
      "Suggest an outfit for a wedding",
      "Show me kurtas under ₹1000",
      "Help me choose a size",
    ],
  };
}
