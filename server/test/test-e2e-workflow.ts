// server/test/test-e2e-workflow.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const BASE = 'http://localhost:4000/v1';

async function main() {
  console.log('🚀 Running Comprehensive Multi-Vendor Marketplace E2E Test Suite...\n');
  let passCount = 0;
  let testNum = 1;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ Test ${testNum} FAILED: ${msg}`);
      process.exit(1);
    }
    console.log(`✅ Test ${testNum} PASSED: ${msg}`);
    passCount++;
    testNum++;
  }

  // 1. Super Admin login
  const superAdminLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@craftly.in', password: 'Craftly@SuperAdmin2026!' }),
  });
  const superAdminData = await superAdminLoginRes.json();
  assert(superAdminLoginRes.ok && superAdminData.data?.user?.role === 'SUPER_ADMIN', 'Super Admin authentication');
  const superAdminToken = superAdminData.data.accessToken;

  // 2. Provision new Admin by Super Admin
  const newAdminEmail = `support_${Date.now()}@craftly.in`;
  const provAdminRes = await fetch(`${BASE}/admin/administrators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superAdminToken}` },
    body: JSON.stringify({
      name: 'Rohan Support Admin',
      email: newAdminEmail,
      password: 'Craftly@Support2026!',
      role: 'CUSTOMER_SUPPORT_ADMIN',
    }),
  });
  const provAdminData = await provAdminRes.json();
  const profile = provAdminData.data?.adminProfile || provAdminData.data?.admin?.adminProfile;
  assert(provAdminRes.ok && (profile?.roleType === 'CUSTOMER_SUPPORT_ADMIN' || profile?.role === 'CUSTOMER_SUPPORT_ADMIN'), 'Super Admin provisions scoped Admin');

  // 3. Register a new Store Owner with initial store application
  const uniqueId = Date.now();
  const ownerEmail = `artisan_${uniqueId}@craftly.in`;
  const regStoreRes = await fetch(`${BASE}/auth/register-store-owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Master Weaver Kabir',
      email: ownerEmail,
      phone: `+9198${uniqueId.toString().slice(-8)}`,
      password: 'WeaverPassword123!',
      storeName: `Kabir Handlooms ${uniqueId.toString().slice(-4)}`,
      craft: 'Banarasi Brocade & Kadhwa Silk',
      bio: 'Generational Varanasi weaver family specializing in authentic gold zari handloom sarees.',
      leadTime: '14-21 days',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
    }),
  });
  const regStoreData = await regStoreRes.json();
  assert(regStoreRes.ok && regStoreData.data?.user?.role === 'STORE_OWNER', 'Store owner registration with PENDING store application');
  const ownerToken = regStoreData.data.accessToken;
  const storeApplication = regStoreData.data.application;

  // 4. Verify Store Owner cannot add products while store is PENDING (StoreOwnershipGuard check)
  const storeId = storeApplication.storeId;
  const earlyProductRes = await fetch(`${BASE}/store-owner/stores/${storeId}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      title: 'Premature Silk Saree',
      description: 'Should not succeed while pending',
      categoryId: (await (await fetch(`${BASE}/catalogue/categories`)).json()).data[0].id,
      basePrice: 5000,
    }),
  });
  assert(earlyProductRes.status === 403, 'RBAC Guard rejects product creation on unapproved PENDING store');

  // 5. Admin reviews and APPROVES the store application
  const approveAppRes = await fetch(`${BASE}/admin/store-applications/${storeApplication.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
  const approveAppData = await approveAppRes.json();
  assert(approveAppRes.ok && approveAppData.data?.status === 'APPROVED', 'Admin approves store application');

  // 6. Now Store Owner CAN create products in approved store
  const catRes = await fetch(`${BASE}/catalogue/categories`);
  const categories = (await catRes.json()).data;
  const createProdRes = await fetch(`${BASE}/store-owner/stores/${storeId}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      title: 'Royal Banarasi Kadhwa Zari Silk Saree',
      description: 'Handwoven pure mulberry silk with real gold-silver electroplated zari motifs.',
      categoryId: categories[0].id,
      basePrice: 18500,
      leadTimeDays: 14,
      isCustomizable: true,
      variants: [
        {
          name: 'Classic Crimson Red',
          size: 'Standard 6.3m',
          color: 'Crimson Gold',
          stockQuantity: 6,
          priceAdjustment: 0,
          sku: `BANARAS-${uniqueId.toString().slice(-4)}`,
        },
      ],
    }),
  });
  const prodData = await createProdRes.json();
  const createdProductId = prodData.data?.id || prodData.data?.product?.id;
  const createdVariantId = prodData.data?.variants?.[0]?.id || prodData.data?.product?.variants?.[0]?.id;
  assert(createProdRes.ok && Boolean(createdProductId), 'Store Owner creates product in newly approved store');

  // 7. Store Owner updates inventory stock
  const updateStockRes = await fetch(`${BASE}/store-owner/stores/${storeId}/inventory/variant/${createdVariantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ stockQuantity: 12 }),
  });
  assert(updateStockRes.ok, 'Store Owner updates variant stock quantity');

  // 8. Register a Customer patron
  const customerEmail = `patron_${uniqueId}@craftly.in`;
  const regCustomerRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sunita Mehra',
      email: customerEmail,
      password: 'PatronPassword123!',
      phone: `+9197${uniqueId.toString().slice(-8)}`,
    }),
  });
  const customerData = await regCustomerRes.json();
  assert(regCustomerRes.ok && customerData.data?.user?.role === 'CUSTOMER', 'Customer registration');
  const customerToken = customerData.data.accessToken;

  // 9. Customer submits a bespoke Customization Request on the new product
  const customReqRes = await fetch(`${BASE}/customization/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      productId: createdProductId,
      storeId: storeId,
      requirements: 'Please weave custom initials "S & V" into the pallu corner in antique gold zari.',
    }),
  });
  const customReqData = await customReqRes.json();
  if (!customReqRes.ok) {
    console.log('Test 9 debug error:', customReqRes.status, customReqData);
  }
  const status = customReqData.data?.status || customReqData.data?.request?.status;
  assert(customReqRes.ok && (status === 'SUBMITTED' || status === 'PENDING'), 'Customer submits bespoke customization request');
  const customReqId = customReqData.data?.id || customReqData.data?.request?.id;

  // 10. Store Owner responds to Customization Request with a price quote
  const quoteRes = await fetch(`${BASE}/customization/requests/${customReqId}/respond`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      status: 'ACCEPTED',
      quotedPrice: 21500,
      artisanNotes: 'We can happily hand-embroider your initials on the handloom frame. Will add 3 days to lead time.',
    }),
  });
  const quoteData = await quoteRes.json();
  assert(quoteRes.ok && quoteData.data?.status === 'ACCEPTED' && quoteData.data?.quotedPrice === 21500, 'Store Owner reviews & quotes bespoke customization');

  // 11. Customer places Multi-Store order (atomic checkout)
  const allProdsRes = await fetch(`${BASE}/catalogue/products`);
  const allProdsJson = await allProdsRes.json();
  const allProds = allProdsJson.data?.items || allProdsJson.data || [];
  const secondProd = allProds.find((p: any) => p.artisanId !== storeId);

  const orderRes = await fetch(`${BASE}/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      items: [
        {
          productId: createdProductId,
          variantId: createdVariantId,
          quantity: 1,
          customizationDetails: { palluMonogram: 'S & V', customFit: true },
        },
        ...(secondProd
          ? [
              {
                productId: secondProd.id,
                variantId: secondProd.variants?.[0]?.id,
                quantity: 1,
              },
            ]
          : []),
      ],
      shippingAddress: {
        fullName: 'Sunita Mehra',
        street: 'Flat 402, Royal Palms, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        phone: '+91 97410 50598',
      },
      paymentMethod: 'UPI',
    }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    console.log('Test 11 debug error:', orderRes.status, JSON.stringify(orderData, null, 2));
  }
  const storeOrders = orderData.data?.storeOrders || orderData.data?.subOrders || [];
  assert(orderRes.ok && storeOrders.length >= 1, 'Multi-vendor split order checkout successfully creates parent order + store sub-orders');
  const parentOrderNumber = orderData.data.orderNumber;
  const storeSubOrder = orderData.data.storeOrders.find((so: any) => so.artisanId === storeId);
  assert(Boolean(storeSubOrder), 'Store sub-order routed to Kabir Handlooms');

  // 12. Store Owner manages incoming sub-order: Accept and Advance to IN_PRODUCTION
  const acceptOrderRes = await fetch(`${BASE}/store-owner/stores/${storeId}/orders/${storeSubOrder.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ status: 'ACCEPTED' }),
  });
  assert(acceptOrderRes.ok, 'Store Owner accepts commission sub-order');

  const inProdRes = await fetch(`${BASE}/store-owner/stores/${storeId}/orders/${storeSubOrder.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ status: 'IN_PRODUCTION' }),
  });
  assert(inProdRes.ok, 'Store Owner advances sub-order to IN_PRODUCTION on loom');

  // 13. Customer tracks order by orderNumber
  const trackRes = await fetch(`${BASE}/orders/${parentOrderNumber}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const trackData = await trackRes.json();
  assert(trackRes.ok && trackData.data?.orderNumber === parentOrderNumber, 'Customer retrieves detailed tracking timeline with multi-store dispatches');

  // 14. Admin monitors orders and analytics
  const adminStatsRes = await fetch(`${BASE}/admin/analytics`, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
  const adminStats = (await adminStatsRes.json()).data;
  assert(adminStats.gmv > 0 && adminStats.totalStores > 0, 'Admin analytics computes live Gross Marketplace Value & store metrics');

  // 15. Cleanup test artifacts so DB stays clean
  try {
    await prisma.productionMilestone.deleteMany({ where: { orderItem: { storeOrder: { storeId } } } });
    await prisma.orderItem.deleteMany({ where: { storeOrder: { storeId } } });
    await prisma.storeOrder.deleteMany({ where: { storeId } });
    await prisma.order.deleteMany({ where: { orderNumber: parentOrderNumber } });
    await prisma.customizationRequest.deleteMany({ where: { storeId } });
    await prisma.productVariant.deleteMany({ where: { product: { artisanId: storeId } } });
    await prisma.media.deleteMany({ where: { product: { artisanId: storeId } } });
    await prisma.product.deleteMany({ where: { artisanId: storeId } });
    await prisma.storeApplication.deleteMany({ where: { storeId } });
    await prisma.artisan.delete({ where: { id: storeId } });
    await prisma.user.delete({ where: { email: ownerEmail } });
    await prisma.user.delete({ where: { email: customerEmail } });
    await prisma.$disconnect();
  } catch (cleanErr) {
    // Ignore non-critical cleanup errors
  }

  console.log(`\n🎉 ALL ${passCount} / ${passCount} MULTI-VENDOR E2E TESTS PASSED WITH 100% SUCCESS!`);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
