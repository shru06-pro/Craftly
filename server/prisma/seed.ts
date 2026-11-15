import { PrismaClient, Role, UserStatus, ProductStatus, DiscountType, StoreStatus, AdminRoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Craftly database seed...');

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('craftly123', salt);
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Craftly@SuperAdmin2026!';
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, salt);
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@craftly.in';

  // 1. Seed Super Admin User & Admin Profile
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: superAdminEmail,
      name: 'Craftly Chief Super Admin',
      phone: '+919999900001',
      passwordHash: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      marketingConsent: true,
      whatsappConsent: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: superAdmin.id },
    update: {
      roleType: AdminRoleType.SUPER_ADMIN,
      permissions: ['*'],
      isActive: true,
    },
    create: {
      userId: superAdmin.id,
      roleType: AdminRoleType.SUPER_ADMIN,
      permissions: ['*'],
      isActive: true,
    },
  });
  console.log(`✓ Super Admin created: ${superAdmin.email}`);

  // 2. Seed Store Approval Admin
  const approvalAdmin = await prisma.user.upsert({
    where: { email: 'storeadmin@craftly.in' },
    update: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'storeadmin@craftly.in',
      name: 'Craftly Store Approval Officer',
      phone: '+919999900002',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: approvalAdmin.id },
    update: {
      roleType: AdminRoleType.STORE_APPROVAL_ADMIN,
      permissions: ['stores:read', 'stores:approve', 'stores:reject', 'stores:suspend'],
      isActive: true,
    },
    create: {
      userId: approvalAdmin.id,
      roleType: AdminRoleType.STORE_APPROVAL_ADMIN,
      permissions: ['stores:read', 'stores:approve', 'stores:reject', 'stores:suspend'],
      isActive: true,
    },
  });
  console.log(`✓ Store Approval Admin created: ${approvalAdmin.email}`);

  // 3. Seed Demo Store Owner (owns Noor Chikankari & Chippa Mohalla)
  const storeOwner = await prisma.user.upsert({
    where: { email: 'owner@craftly.in' },
    update: {
      role: Role.STORE_OWNER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'owner@craftly.in',
      name: 'Begum Naseem Akhtar',
      phone: '+919876543210',
      passwordHash: defaultPasswordHash,
      role: Role.STORE_OWNER,
      status: UserStatus.ACTIVE,
      marketingConsent: true,
      whatsappConsent: true,
    },
  });
  console.log(`✓ Store Owner created: ${storeOwner.email}`);

  // 4. Seed Demo Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@craftly.in' },
    update: {
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'customer@craftly.in',
      name: 'Aarav Sharma',
      phone: '+919811122233',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      marketingConsent: true,
      whatsappConsent: true,
    },
  });

  // Seed Customer Default Address
  const existingAddress = await prisma.address.findFirst({
    where: { userId: customer.id },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        fullName: 'Aarav Sharma',
        phone: '+919811122233',
        line1: 'B-42, Gulmohar Enclave, Near Metro Gate 2',
        locality: 'Hauz Khas',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110016',
        isDefault: true,
      },
    });
  }
  console.log(`✓ Customer created: ${customer.email}`);

  // 5. Seed Categories
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

  // 6. Seed Artisans / Stores (linking Noor Chikankari to storeOwner)
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
      bannerUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      storeEmail: 'contact@noorchikankari.in',
      storePhone: '+919876543210',
      leadTimeMinDays: 4,
      leadTimeMaxDays: 6,
      verified: true,
      isFeatured: true,
      status: StoreStatus.APPROVED,
      ownerId: storeOwner.id,
      approvedAt: new Date(),
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
      bannerUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
      storeEmail: 'chippablockprints@craftly.in',
      storePhone: '+919829012345',
      leadTimeMinDays: 5,
      leadTimeMaxDays: 7,
      verified: true,
      isFeatured: true,
      status: StoreStatus.APPROVED,
      ownerId: storeOwner.id,
      approvedAt: new Date(),
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
      verified: true,
      isFeatured: true,
      status: StoreStatus.APPROVED,
      approvedAt: new Date(),
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
      verified: true,
      isFeatured: true,
      status: StoreStatus.APPROVED,
      approvedAt: new Date(),
    },
    {
      id: 'artisan-jewelry',
      name: 'Keshav & Sunita Soni',
      studioName: 'Johari Bazaar Smiths',
      craft: 'Meenakari & Kundan Jewelry',
      location: 'Johari Bazaar, Jaipur',
      state: 'Rajasthan',
      badge: 'Heirloom Craft',
      bio: 'Flame-chased recycled brass with hand-enamelled Meenakari backplate and uncut kundan stones.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      leadTimeMinDays: 3,
      leadTimeMaxDays: 5,
      verified: true,
      isFeatured: false,
      status: StoreStatus.APPROVED,
      approvedAt: new Date(),
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
      verified: true,
      isFeatured: false,
      status: StoreStatus.APPROVED,
      approvedAt: new Date(),
    },
  ];

  for (const art of artisansData) {
    await prisma.artisan.upsert({
      where: { id: art.id },
      update: art,
      create: art,
    });
  }
  console.log(`✓ Seeded ${artisansData.length} artisan stores`);

  // 7. Seed Products with Variants & Media
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
        { colorName: 'Ivory White', colorHex: '#FAF6EE', sampleImage: '/images/chikankari/ivory.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stockQuantity: 25 },
        { colorName: 'Terracotta Rust', colorHex: '#B85834', sampleImage: '/images/chikankari/terracotta.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stockQuantity: 18 },
        { colorName: 'Pistachio Sage', colorHex: '#7A8F78', sampleImage: '/images/chikankari/sage.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stockQuantity: 15 },
        { colorName: 'Indigo Neel', colorHex: '#2B4365', sampleImage: '/images/chikankari/indigo.jpg', isPhotographedSample: true, inStock: true, isMadeToOrder: false, availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stockQuantity: 12 },
        { colorName: 'Saffron Marigold', colorHex: '#DE7C38', sampleImage: null, isPhotographedSample: false, inStock: false, isMadeToOrder: true, leadTime: 'Made to Order (7-10 business days)', artisanNote: 'Individually hand-dyed with marigold and turmeric extract upon commission.', availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stockQuantity: 0 },
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
        { colorName: 'Indigo Cobalt', colorHex: '#1E3A5F', sampleImage: '/images/bagru/indigo.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL'], stockQuantity: 20 },
        { colorName: 'Madder Rust', colorHex: '#96432B', sampleImage: '/images/bagru/madder_rust.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL'], stockQuantity: 14 },
        { colorName: 'Kashi Slate', colorHex: '#4A4E54', sampleImage: '/images/bagru/kashi_slate.jpg', isPhotographedSample: true, availableSizes: ['XS', 'S', 'M', 'L', 'XL'], stockQuantity: 10 },
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
        { colorName: 'Warm Cognac Tan', colorHex: '#A05928', sampleImage: '/images/leather/cognac.jpg', isPhotographedSample: true, availableSizes: ['Standard Tote (15" x 13" x 5")'], stockQuantity: 15 },
        { colorName: 'Dark Espresso', colorHex: '#33231D', sampleImage: '/images/leather/espresso.jpg', isPhotographedSample: true, availableSizes: ['Standard Tote (15" x 13" x 5")'], stockQuantity: 10 },
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
        { colorName: 'Deep Maroon Zari', colorHex: '#58111A', sampleImage: '/images/textiles/maroon.jpg', isPhotographedSample: true, availableSizes: ['Standard 6.3m (Includes Blouse Piece)'], stockQuantity: 8 },
        { colorName: 'Mustard Haldi', colorHex: '#C98A2C', sampleImage: '/images/textiles/mustard.jpg', isPhotographedSample: true, availableSizes: ['Standard 6.3m (Includes Blouse Piece)'], stockQuantity: 6 },
      ],
      media: [
        { url: '/images/textiles/maroon.jpg', altText: 'Maheshwari Silk-Cotton Saree in Deep Maroon', sortOrder: 1 },
      ],
    },
    {
      id: 'prod-5',
      slug: 'meenakari-kundan-choker',
      name: 'Hand-Hammered Meenakari & Kundan Choker',
      tagline: 'Flame-Chased Brass with Enamelling',
      description: 'Flame-chased recycled brass with hand-enamelled Meenakari backplate and uncut faux-kundan glass stones on an adjustable silk dori cord.',
      craftDetails: 'Handmade by master smiths in Johari Bazaar using age-old enamelling recipes.',
      materials: 'Recycled Brass, Glass Kundan & Silk Thread',
      artisanId: 'artisan-jewelry',
      categorySlug: 'jewelry',
      basePricePaise: 149900,
      compareAtPricePaise: 199900,
      allowsCustomMeasurements: false,
      tailoringFeePaise: 0,
      leadTimeMinDays: 3,
      leadTimeMaxDays: 5,
      rating: 4.8,
      reviewsCount: 39,
      variants: [
        { colorName: 'Antique Gold Finish', colorHex: '#C89D42', sampleImage: '/images/jewelry/gold.jpg', isPhotographedSample: true, availableSizes: ['Adjustable Dori (12" - 20")'], stockQuantity: 20 },
        { colorName: 'Silver Oxide Polish', colorHex: '#969A9E', sampleImage: '/images/jewelry/silver.jpg', isPhotographedSample: true, availableSizes: ['Adjustable Dori (12" - 20")'], stockQuantity: 12 },
      ],
      media: [
        { url: '/images/jewelry/gold.jpg', altText: 'Meenakari Kundan Choker', sortOrder: 1 },
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
      basePricePaise: 89900, // ₹899
      compareAtPricePaise: 119900,
      allowsCustomMeasurements: false,
      tailoringFeePaise: 0,
      leadTimeMinDays: 2,
      leadTimeMaxDays: 4,
      rating: 4.7,
      reviewsCount: 31,
      variants: [
        { colorName: 'Earthen Red Clay', colorHex: '#9E472A', sampleImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80', isPhotographedSample: true, availableSizes: ['180ml Standard Chai Cups (Box of 4)'], stockQuantity: 30 },
      ],
      media: [
        { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80', altText: 'Molela Terracotta Chai Kulhad Set', sortOrder: 1 },
      ],
    },
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug)!;
    const product = await prisma.product.upsert({
      where: { id: prod.id },
      update: {
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

    for (const v of prod.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, colorName: v.colorName },
      });
      if (existing) {
        await prisma.productVariant.update({
          where: { id: existing.id },
          data: {
            sampleImage: v.sampleImage ?? null,
            isPhotographedSample: Boolean(v.isPhotographedSample),
            isMadeToOrder: Boolean((v as any).isMadeToOrder),
            leadTime: (v as any).leadTime ?? null,
            artisanNote: (v as any).artisanNote ?? null,
            inStock: (v as any).inStock ?? true,
            stockQuantity: v.stockQuantity,
            availableSizes: v.availableSizes,
          },
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorName: v.colorName,
            colorHex: v.colorHex,
            sampleImage: v.sampleImage ?? null,
            isPhotographedSample: Boolean(v.isPhotographedSample),
            isMadeToOrder: Boolean((v as any).isMadeToOrder),
            leadTime: (v as any).leadTime ?? null,
            artisanNote: (v as any).artisanNote ?? null,
            inStock: (v as any).inStock ?? true,
            availableSizes: v.availableSizes,
            stockQuantity: v.stockQuantity,
          },
        });
      }
    }

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
  console.log(`✓ Seeded ${productsData.length} products with stock and variants`);

  // 8. Seed Coupons
  const couponsData = [
    {
      code: 'CRAFTLY10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minCartValuePaise: 0,
      maxDiscountPaise: 100000,
      maxUsesPerUser: 3,
      isActive: true,
    },
    {
      code: 'FIRSTCRAFT',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minCartValuePaise: 150000,
      maxDiscountPaise: 150000,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: 'ATELIER500',
      discountType: DiscountType.FLAT_PAISE,
      discountValue: 50000,
      minCartValuePaise: 250000,
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
  console.log(`✓ Seeded ${couponsData.length} coupons`);

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
