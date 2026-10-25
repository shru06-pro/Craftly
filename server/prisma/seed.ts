import { PrismaClient, Role, UserStatus, ProductStatus, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Craftly database seed...');

  // 1. Seed Demo Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@craftly.in' },
    update: {},
    create: {
      email: 'admin@craftly.in',
      name: 'Craftly Atelier Admin',
      phone: '+919999900000',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dev_admin_hash_placeholder',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      marketingConsent: true,
      whatsappConsent: true,
    },
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  // 2. Seed Categories
  const categoriesData = [
    { slug: 'apparel', name: 'Handcrafted Apparel', description: 'Bespoke kurtas, tunics, and drapes by master artisans', sortOrder: 1 },
    { slug: 'leather', name: 'Artisan Leather', description: 'Vegetable-tanned Santiniketan and full-grain handcrafted leather', sortOrder: 2 },
    { slug: 'jewelry', name: 'Handcrafted Jewelry', description: 'Traditional silver filigree and temple brass jewelry', sortOrder: 3 },
    { slug: 'accessories', name: 'Textiles & Stoles', description: 'Handloom Maheshwari silk-cotton and Bagru stoles', sortOrder: 4 },
    { slug: 'home', name: 'Studio Home Pottery', description: 'Wheel-thrown terracotta and Molela clay homeware', sortOrder: 5 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✓ Seeded ${categoriesData.length} categories`);

  // 3. Seed Artisans
  const artisansData = [
    {
      id: 'artisan-chikankari',
      name: 'Begum Naseem Akhtar',
      studioName: 'Noor Chikankari Guild',
      craft: 'Lucknow Chikankari',
      location: 'Hazratganj, Lucknow',
      state: 'Uttar Pradesh',
      badge: 'National Awardee',
      bio: 'Generational master artisan carrying forward 400 years of Awadhi needlework with 32 authentic stitches on pure handspun muslin.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 4,
      leadTimeMaxDays: 6,
      isFeatured: true,
    },
    {
      id: 'artisan-bagru',
      name: 'Ramdev Chippa',
      studioName: 'Chippa Mohalla Ateliers',
      craft: 'Bagru Dabu Mud-Resist Print',
      location: 'Bagru, Jaipur',
      state: 'Rajasthan',
      badge: 'Master Weaver',
      bio: 'Practicing 5th generation natural indigo and madder mud-resist hand-block printing using hand-carved teakwood blocks.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 5,
      leadTimeMaxDays: 7,
      isFeatured: true,
    },
    {
      id: 'artisan-leather',
      name: 'Subhash Mondal',
      studioName: 'Bishnupur Craft Guild',
      craft: 'Santiniketan Embossed Leather',
      location: 'Santiniketan, Bolpur',
      state: 'West Bengal',
      badge: 'Bestseller Atelier',
      bio: 'Pioneering traditional vegetable-tanned full-grain leather craft inspired by the Rabindranath Tagore aesthetic movement.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 3,
      leadTimeMaxDays: 5,
      isFeatured: true,
    },
    {
      id: 'artisan-maheshwari',
      name: 'Malati Varma',
      studioName: 'Maheshwar Weavers Collective',
      craft: 'Maheshwari Handloom Silk',
      location: 'Maheshwar, Khargone',
      state: 'Madhya Pradesh',
      badge: 'GI Certified',
      bio: 'Weaving heritage Ahilya Bai Holkar revival motifs with pure silk warp and superfine cotton weft along the Narmada banks.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 4,
      leadTimeMaxDays: 6,
      isFeatured: true,
    },
    {
      id: 'artisan-jewelry',
      name: 'Ananya Rao',
      studioName: 'Cuttack Filigree Guild',
      craft: 'Tarakasi Silver Filigree',
      location: 'Cuttack',
      state: 'Odisha',
      badge: 'Heirloom Craft',
      bio: 'Master of spiderweb-fine 92.5 Sterling silver filigree, transforming molten wires into intricate heirloom jewelry.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 3,
      leadTimeMaxDays: 5,
      isFeatured: false,
    },
    {
      id: 'artisan-pottery',
      name: 'Master Gopal Kumhar',
      studioName: 'Molela Terracotta Ateliers',
      craft: 'Wheel-Thrown Terracotta',
      location: 'Molela, Rajsamand',
      state: 'Rajasthan',
      badge: 'Heritage Pottery',
      bio: 'Shaping local clay into glazed, food-safe everyday vessels that mature in rustic wood-fired kilns.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 2,
      leadTimeMaxDays: 4,
      isFeatured: false,
    },
  ];

  for (const art of artisansData) {
    await prisma.artisan.upsert({
      where: { id: art.id },
      update: art,
      create: art,
    });
  }
  console.log(`✓ Seeded ${artisansData.length} artisan guilds`);

  // 4. Seed Products with Variants & Media
  const productsData = [
    {
      id: 'prod-1',
      slug: 'chikankari-muslin-kurta',
      name: 'Hand-Embroidered Chikankari Muslin Kurta',
      tagline: 'Pure Mulmul with 32 Traditional Stitches',
      description: 'Pure hand-spun unbleached muslin with 32 authentic Chikankari stitches including Murri, Phanda, and Keel Kangan. Bespoke sleeve length & personalized monogramming.',
      craftDetails: 'Handcrafted in Hazratganj ateliers using unbleached combed cotton threads on featherweight muslin fabric.',
      materials: '100% Breathable Mulmul Cotton',
      artisanId: 'artisan-chikankari',
      categorySlug: 'apparel',
      basePricePaise: 249900, // ₹2,499
      compareAtPricePaise: 329900, // ₹3,299
      allowsCustomMeasurements: true,
      tailoringFeePaise: 35000, // ₹350
      leadTimeMinDays: 4,
      leadTimeMaxDays: 6,
      rating: 4.9,
      reviewsCount: 68,
      variants: [
        { colorName: 'Ivory White', colorHex: '#FAF6EE', sampleImage: '/images/chikankari/ivory.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { colorName: 'Terracotta Rust', colorHex: '#B85834', sampleImage: '/images/chikankari/terracotta.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { colorName: 'Pistachio Sage', colorHex: '#7A8F78', sampleImage: '/images/chikankari/sage.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { colorName: 'Indigo Neel', colorHex: '#2B4365', sampleImage: '/images/chikankari/indigo.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { colorName: 'Saffron Marigold', colorHex: '#DE7C38', sampleImage: '/images/chikankari/terracotta.jpg', isPhotographedSample: false, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      ],
      media: [
        { url: '/images/chikankari/ivory.jpg', altText: 'Chikankari Kurta in Ivory White', sortOrder: 1 },
        { url: '/images/chikankari/terracotta.jpg', altText: 'Chikankari Kurta in Terracotta Rust', sortOrder: 2 },
      ],
    },
    {
      id: 'prod-2',
      slug: 'bagru-dabu-block-printed-dress',
      name: 'Bagru Dabu Mud-Resist Block-Printed Dress',
      tagline: 'Fermented Indigo Vats & River Clay Resist',
      description: 'Carved teakwood block print using river clay dabu resist and fermented indigo vats. Tailored with mother-of-pearl buttons and deep side pockets.',
      craftDetails: 'Multiple dips into centuries-old mud vats in Bagru village followed by sun-drying on riverbeds.',
      materials: 'Organic Khadi Handloom Cotton',
      artisanId: 'artisan-bagru',
      categorySlug: 'apparel',
      basePricePaise: 289900,
      compareAtPricePaise: 360000,
      allowsCustomMeasurements: true,
      tailoringFeePaise: 35000,
      leadTimeMinDays: 5,
      leadTimeMaxDays: 7,
      rating: 4.9,
      reviewsCount: 44,
      variants: [
        { colorName: 'Indigo Cobalt', colorHex: '#1E3A5F', sampleImage: '/images/bagru/indigo.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL'] },
        { colorName: 'Madder Rust', colorHex: '#96432B', sampleImage: '/images/bagru/madder_rust.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL'] },
        { colorName: 'Kashi Slate', colorHex: '#4A4E54', sampleImage: '/images/bagru/kashi_slate.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL'] },
      ],
      media: [
        { url: '/images/bagru/indigo.jpg', altText: 'Bagru Dabu Dress in Indigo Cobalt', sortOrder: 1 },
      ],
    },
    {
      id: 'prod-3',
      slug: 'santiniketan-leather-tote',
      name: 'Vegetable-Tanned Santiniketan Leather Tote',
      tagline: 'Babool Bark Tanned with Embossed Motifs',
      description: 'Full-grain saddle hide treated with babool tree bark tanning. Hand-embossed with traditional floral motifs and personalized monogram stamp.',
      craftDetails: 'Hand-dyed and hot-die embossed by Santiniketan leather artisans in West Bengal.',
      materials: 'Full-Grain Vegetable-Tanned Leather',
      artisanId: 'artisan-leather',
      categorySlug: 'leather',
      basePricePaise: 325000,
      compareAtPricePaise: 420000,
      allowsCustomMeasurements: false,
      tailoringFeePaise: 0,
      leadTimeMinDays: 3,
      leadTimeMaxDays: 5,
      rating: 5.0,
      reviewsCount: 76,
      variants: [
        { colorName: 'Warm Cognac Tan', colorHex: '#A05928', sampleImage: '/images/leather/cognac.jpg', isPhotographedSample: true, availableSizes: ['Standard Tote (15" x 13" x 5")'] },
        { colorName: 'Dark Espresso', colorHex: '#33231D', sampleImage: '/images/leather/espresso.jpg', isPhotographedSample: true, availableSizes: ['Standard Tote (15" x 13" x 5")'] },
      ],
      media: [
        { url: '/images/leather/cognac.jpg', altText: 'Santiniketan Leather Tote in Warm Cognac', sortOrder: 1 },
      ],
    },
    {
      id: 'prod-4',
      slug: 'maheshwari-silk-cotton-saree',
      name: 'Zari-Bordered Maheshwari Silk-Cotton Saree',
      tagline: 'Fort Revival Ahilya Bai Holkar Motifs',
      description: 'Reversible Ahilya fort architectural zari borders hand-woven with pure mulberry silk warp and fine Narmada valley cotton weft.',
      craftDetails: 'Woven on pit looms in Maheshwar by women artisan collectives.',
      materials: 'Mulberry Silk (50%) & Cotton (50%) with Real Zari',
      artisanId: 'artisan-maheshwari',
      categorySlug: 'accessories',
      basePricePaise: 420000,
      compareAtPricePaise: 540000,
      allowsCustomMeasurements: false,
      tailoringFeePaise: 0,
      leadTimeMinDays: 4,
      leadTimeMaxDays: 6,
      rating: 4.8,
      reviewsCount: 39,
      variants: [
        { colorName: 'Deep Maroon Zari', colorHex: '#58111A', sampleImage: '/images/textiles/maroon.jpg', isPhotographedSample: true, availableSizes: ['Standard 6.3m (Includes Blouse Piece)'] },
        { colorName: 'Mustard Haldi', colorHex: '#C98A2C', sampleImage: '/images/textiles/mustard.jpg', isPhotographedSample: true, availableSizes: ['Standard 6.3m (Includes Blouse Piece)'] },
      ],
      media: [
        { url: '/images/textiles/maroon.jpg', altText: 'Maheshwari Silk-Cotton Saree in Deep Maroon', sortOrder: 1 },
      ],
    },
    {
      id: 'prod-5',
      slug: 'cuttack-tarakasi-silver-jhumkas',
      name: 'Filigree Tarakasi Silver Chandbali Jhumkas',
      tagline: '92.5 Sterling Silver Fine Wire Art',
      description: 'Whisper-light silver filigree crafted using hair-fine wires drawn through diamonds, coiled and soldered into delicate crescent blooms.',
      craftDetails: 'Handmade by master goldsmiths in Cuttack using traditional charcoal torch brazing.',
      materials: '92.5 Hallmarked Sterling Silver',
      artisanId: 'artisan-jewelry',
      categorySlug: 'jewelry',
      basePricePaise: 185000,
      compareAtPricePaise: 230000,
      allowsCustomMeasurements: false,
      tailoringFeePaise: 0,
      leadTimeMinDays: 3,
      leadTimeMaxDays: 5,
      rating: 4.9,
      reviewsCount: 52,
      variants: [
        { colorName: 'Oxidised Antique Silver', colorHex: '#A8A9AD', sampleImage: '/images/jewelry/silver.jpg', isPhotographedSample: true, availableSizes: ['One Size (4.2cm Drop)'] },
        { colorName: '22K Gold Vermeil Dip', colorHex: '#D4AF37', sampleImage: '/images/jewelry/gold.jpg', isPhotographedSample: true, availableSizes: ['One Size (4.2cm Drop)'] },
      ],
      media: [
        { url: '/images/jewelry/silver.jpg', altText: 'Tarakasi Silver Chandbali Jhumkas', sortOrder: 1 },
      ],
    },
    {
      id: 'prod-6',
      slug: 'molela-terracotta-kulhad-set',
      name: 'Hand-Carved Molela Terracotta Chai Kulhad Set',
      tagline: 'Kiln-Fired River Silt Clay (Set of 4)',
      description: 'Wheel-thrown natural river silt cups finished with unglazed earthen porousness that enhances the natural aroma of hot spiced masala chai.',
      craftDetails: 'Shaped by hand in Molela village and slow-fired in community kilns using mustard husk fuel.',
      materials: '100% Lead-Free Natural Clay',
      artisanId: 'artisan-pottery',
      categorySlug: 'home',
      basePricePaise: 95000, // ₹950
      compareAtPricePaise: 125000,
      allowsCustomMeasurements: false,
      tailoringFeePaise: 0,
      leadTimeMinDays: 2,
      leadTimeMaxDays: 4,
      rating: 4.7,
      reviewsCount: 31,
      variants: [
        { colorName: 'Earthen Red Clay', colorHex: '#9E472A', sampleImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80', isPhotographedSample: true, availableSizes: ['180ml Standard Chai Cups (Box of 4)'] },
        { colorName: 'Smoked Black Terracotta', colorHex: '#2B2B2B', sampleImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80', isPhotographedSample: false, availableSizes: ['180ml Standard Chai Cups (Box of 4)'] },
      ],
      media: [
        { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80', altText: 'Molela Terracotta Chai Kulhad Set', sortOrder: 1 },
      ],
    },
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug)!;
    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        tagline: prod.tagline,
        description: prod.description,
        craftDetails: prod.craftDetails,
        materials: prod.materials,
        artisanId: prod.artisanId,
        categoryId,
        basePricePaise: prod.basePricePaise,
        compareAtPricePaise: prod.compareAtPricePaise,
        allowsCustomMeasurements: prod.allowsCustomMeasurements,
        tailoringFeePaise: prod.tailoringFeePaise,
        leadTimeMinDays: prod.leadTimeMinDays,
        leadTimeMaxDays: prod.leadTimeMaxDays,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        status: ProductStatus.LIVE,
      },
      create: {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        tagline: prod.tagline,
        description: prod.description,
        craftDetails: prod.craftDetails,
        materials: prod.materials,
        artisanId: prod.artisanId,
        categoryId,
        basePricePaise: prod.basePricePaise,
        compareAtPricePaise: prod.compareAtPricePaise,
        allowsCustomMeasurements: prod.allowsCustomMeasurements,
        tailoringFeePaise: prod.tailoringFeePaise,
        leadTimeMinDays: prod.leadTimeMinDays,
        leadTimeMaxDays: prod.leadTimeMaxDays,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        status: ProductStatus.LIVE,
      },
    });

    // Seed variants
    for (const v of prod.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, colorName: v.colorName },
      });
      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorName: v.colorName,
            colorHex: v.colorHex,
            sampleImage: v.sampleImage,
            isPhotographedSample: v.isPhotographedSample,
            availableSizes: v.availableSizes,
          },
        });
      }
    }

    // Seed media
    for (const m of prod.media) {
      const existing = await prisma.media.findFirst({
        where: { productId: product.id, url: m.url },
      });
      if (!existing) {
        await prisma.media.create({
          data: {
            productId: product.id,
            url: m.url,
            altText: m.altText,
            sortOrder: m.sortOrder,
          },
        });
      }
    }
  }
  console.log(`✓ Seeded ${productsData.length} curated products with variants and media`);

  // 5. Seed Coupons
  const couponsData = [
    {
      code: 'CRAFTLY10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minCartValuePaise: 0,
      maxDiscountPaise: 100000, // ₹1,000 max
      maxUsesPerUser: 3,
      isActive: true,
    },
    {
      code: 'FIRSTCRAFT',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minCartValuePaise: 150000, // ₹1,500 min
      maxDiscountPaise: 150000, // ₹1,500 max
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: 'ATELIER500',
      discountType: DiscountType.FLAT_PAISE,
      discountValue: 50000, // ₹500 flat
      minCartValuePaise: 250000, // ₹2,500 min
      maxDiscountPaise: 50000,
      maxUsesPerUser: 2,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Seeded ${couponsData.length} production coupons`);

  // 6. Seed Sample Collector Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: 'prod-1',
        authorName: 'Ruchika Sen',
        authorCity: 'Kolkata',
        rating: 5,
        headline: 'Authentic Lucknow Murri Work!',
        comment: 'The custom bust and sleeve fit is perfection. The mulmul fabric is genuinely handspun and breathes like a dream in warm weather.',
        verifiedBuyer: true,
      },
      {
        productId: 'prod-1',
        authorName: 'Meera Deshmukh',
        authorCity: 'Pune',
        rating: 5,
        headline: 'Worth every rupee',
        comment: 'You can clearly tell the difference between machine embroidery and Begum Akhtar’s needlework. The personalized monogram was a stunning touch.',
        verifiedBuyer: true,
      },
      {
        productId: 'prod-3',
        authorName: 'Aditya Kashyap',
        authorCity: 'Bengaluru',
        rating: 5,
        headline: 'Superb saddle leather patina',
        comment: 'Smells of natural bark tanning, no chemical solvent odor. The embossed flower motifs look even richer in person.',
        verifiedBuyer: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✓ Seeded sample verified collector reviews`);

  console.log('✅ Craftly database seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
