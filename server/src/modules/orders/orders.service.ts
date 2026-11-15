import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PricingService } from '../pricing/pricing.service.js';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  FulfilmentStatus,
  MilestoneType,
  StoreStatus,
} from '@prisma/client';

import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemInput {
  @IsString()
  productId!: string;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  colorName?: string;

  @IsOptional()
  @IsString()
  colorHex?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsBoolean()
  isCustomSized?: boolean;

  @IsOptional()
  customMeasurements?: any;

  @IsOptional()
  customizationDetails?: any;

  @IsOptional()
  @IsString()
  monogramInitials?: string;

  @IsOptional()
  @IsString()
  customizationNotes?: string;
}

export class ShippingAddressInput {
  @IsString()
  fullName!: string;

  @IsString()
  phone!: string;

  @IsString()
  pincode!: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;
}

export class CheckoutSessionInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemInput)
  items!: CheckoutItemInput[];

  @ValidateNested()
  @Type(() => ShippingAddressInput)
  shippingAddress!: ShippingAddressInput;

  @IsString()
  paymentMethod!: 'UPI' | 'NETBANKING' | 'CARD' | 'COD';

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateSubOrderStatusInput {
  @IsString()
  status!: FulfilmentStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Multi-Vendor Checkout:
   * 1. Validates products and stock quantities
   * 2. Decrements inventory atomically inside a transaction
   * 3. Creates parent Order
   * 4. Creates store-specific Sub-Orders (one per artisan/store)
   * 5. Links order items and creates initial atelier production milestones
   */
  async createCheckoutSession(input: CheckoutSessionInput, authenticatedUserId?: string) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Checkout cart cannot be empty');
    }

    const userId = authenticatedUserId || input.userId || null;

    // Check for existing idempotent order
    if (input.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: {
          storeOrders: { include: { store: true, items: true } },
          items: { include: { milestones: true, artisan: true } },
        },
      });
      if (existing) {
        return this.formatOrder(existing);
      }
    }

    // Fetch all products with their variants & store info
    const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        artisan: true,
        variants: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate products availability and stock
    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }
      if (!product.isAvailable || product.status !== 'LIVE') {
        throw new BadRequestException(`Product '${product.name}' is currently unavailable for purchase`);
      }

      // Check variant stock
      const variant =
        product.variants.find(
          (v) =>
            (item.variantId && v.id === item.variantId) ||
            (item.colorName && v.colorName.toLowerCase() === item.colorName.toLowerCase()),
        ) || product.variants[0];

      if (variant) {
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for '${product.name}' (${variant.colorName}). Only ${variant.stockQuantity} remaining.`,
          );
        }
      }
    }

    // Calculate server-authoritative pricing quote
    const quote = await this.pricingService.calculateQuote({
      items: input.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        isCustomSized: i.isCustomSized,
      })),
      couponCode: input.couponCode,
      pincode: input.shippingAddress.pincode,
    });

    // Group items by store (artisanId)
    const storeItemsMap = new Map<string, CheckoutItemInput[]>();
    for (const item of input.items) {
      const prod = productMap.get(item.productId)!;
      const storeId = prod.artisanId;
      const current = storeItemsMap.get(storeId) || [];
      current.push(item);
      storeItemsMap.set(storeId, current);
    }

    // Generate unique parent order number CRF-IN-XXXXXX
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `CRF-IN-${randomSixDigits}`;

    const paymentMethodEnum = (PaymentMethod as any)[input.paymentMethod] || PaymentMethod.UPI;
    const initialOrderStatus =
      input.paymentMethod === 'COD' ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT;
    const initialPaymentStatus =
      input.paymentMethod === 'COD' ? PaymentStatus.AUTHORIZED : PaymentStatus.PENDING;

    // Transaction-safe execution: decrement stock + create parent order + create sub-orders
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      // 1. Decrement inventory for each item variant
      for (const item of input.items) {
        const prod = productMap.get(item.productId)!;
        const variant =
          prod.variants.find(
            (v) =>
              (item.variantId && v.id === item.variantId) ||
              (item.colorName && v.colorName.toLowerCase() === item.colorName.toLowerCase()),
          ) || prod.variants[0];

        if (variant) {
          const newStock = Math.max(0, variant.stockQuantity - item.quantity);
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stockQuantity: newStock,
              inStock: newStock > 0,
            },
          });
        }
      }

      const resolvedAddress = {
        fullName: input.shippingAddress.fullName || 'Customer',
        phone: input.shippingAddress.phone || '9999999999',
        addressLine:
          input.shippingAddress.addressLine ||
          input.shippingAddress.street ||
          'Artisan Street',
        locality: input.shippingAddress.locality || '',
        city: input.shippingAddress.city || 'City',
        state: input.shippingAddress.state || 'State',
        pincode: input.shippingAddress.pincode || '110001',
      };

      // 2. Create parent Order
      const parentOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: initialOrderStatus,
          subtotalPaise: quote.subtotalPaise,
          tailoringTotalPaise: quote.tailoringTotalPaise,
          shippingFeePaise: quote.shippingFeePaise,
          discountPaise: quote.discountPaise,
          grandTotalPaise: quote.grandTotalPaise,
          couponCode: quote.couponApplied?.code || null,
          paymentMethod: paymentMethodEnum,
          paymentStatus: initialPaymentStatus,
          shippingAddress: resolvedAddress as any,
          idempotencyKey: input.idempotencyKey || null,
        },
      });

      // 3. Create Store-Specific Sub-Orders and OrderItems
      let subOrderIndex = 1;
      for (const [storeId, itemsForStore] of storeItemsMap.entries()) {
        const subOrderNumber = `${orderNumber}-${subOrderIndex++}`;

        // Calculate store subtotal and tailoring fee
        let storeSubtotalPaise = 0;
        let storeTailoringPaise = 0;

        for (const item of itemsForStore) {
          const prod = productMap.get(item.productId)!;
          storeSubtotalPaise += prod.basePricePaise * item.quantity;
          if (item.isCustomSized) {
            storeTailoringPaise += prod.tailoringFeePaise * item.quantity;
          }
        }

        const storeTotalPaise = storeSubtotalPaise + storeTailoringPaise;

        const storeOrder = await tx.storeOrder.create({
          data: {
            subOrderNumber,
            orderId: parentOrder.id,
            storeId,
            status: FulfilmentStatus.AWAITING_ARTISAN,
            subtotalPaise: storeSubtotalPaise,
            tailoringFeePaise: storeTailoringPaise,
            shippingFeePaise: 0,
            totalPaise: storeTotalPaise,
          },
        });

        // Create OrderItems linked to both parent order and store sub-order
        for (const item of itemsForStore) {
          const prod = productMap.get(item.productId)!;
          const tailoringFeePaise = item.isCustomSized ? prod.tailoringFeePaise : 0;
          const variant =
            prod.variants.find(
              (v) =>
                (item.variantId && v.id === item.variantId) ||
                (item.colorName && v.colorName.toLowerCase() === item.colorName.toLowerCase()),
            ) || prod.variants[0];
          const colorName = item.colorName || variant?.colorName || 'Default';
          const size = item.size || 'Standard';

          await tx.orderItem.create({
            data: {
              orderId: parentOrder.id,
              storeOrderId: storeOrder.id,
              artisanId: storeId,
              productId: prod.id,
              productName: prod.name,
              colorName,
              size,
              isCustomSized: Boolean(item.isCustomSized),
              measurementsSnapshot:
                ((item.customMeasurements || item.customizationDetails) as any) ||
                null,
              monogramInitials: item.monogramInitials || null,
              customizationNotes: item.customizationNotes || null,
              unitPricePaise: prod.basePricePaise,
              tailoringFeePaise,
              quantity: item.quantity,
              status: FulfilmentStatus.AWAITING_ARTISAN,
              milestones: {
                create: [
                  {
                    type: MilestoneType.MATERIALS_READY,
                    title: 'Order Confirmed with Artisan Atelier',
                    description: `Artisan atelier ${prod.artisan.studioName} notified. Preparing handloom fabrics and natural dye lots.`,
                  },
                ],
              },
            },
          });
        }
      }

      return parentOrder;
    });

    // Fetch and return formatted full order
    return this.getOrderByNumber(createdOrder.orderNumber);
  }

  /**
   * Track / Get single order by orderNumber with full tracking & store sub-orders
   */
  async getOrderByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        storeOrders: {
          include: {
            store: {
              select: {
                id: true,
                studioName: true,
                name: true,
                location: true,
                state: true,
                craft: true,
                avatarUrl: true,
              },
            },
            items: {
              include: {
                milestones: { orderBy: { recordedAt: 'asc' } },
                product: {
                  select: {
                    id: true,
                    slug: true,
                    media: { take: 1, select: { url: true } },
                    variants: { take: 1, select: { sampleImage: true } },
                  },
                },
              },
            },
          },
          orderBy: { subOrderNumber: 'asc' },
        },
        items: {
          include: {
            milestones: { orderBy: { recordedAt: 'asc' } },
            artisan: true,
            product: { select: { id: true, slug: true, media: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderNumber}`);
    }

    return this.formatOrder(order);
  }

  /**
   * Customer: View all personal order history
   */
  async getCustomerOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        storeOrders: {
          include: {
            store: { select: { studioName: true, craft: true, location: true } },
            items: {
              include: {
                product: {
                  select: {
                    media: { take: 1, select: { url: true } },
                    variants: { take: 1, select: { sampleImage: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      grandTotal: o.grandTotalPaise / 100,
      itemCount: o.storeOrders.reduce((sum, so) => sum + so.items.length, 0),
      storeCount: o.storeOrders.length,
      createdAt: o.createdAt,
      subOrders: o.storeOrders.map((so) => ({
        id: so.id,
        subOrderNumber: so.subOrderNumber,
        storeName: so.store.studioName,
        craft: so.store.craft,
        status: so.status,
        total: so.totalPaise / 100,
        items: so.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          colorName: i.colorName,
          size: i.size,
          image: i.product?.media[0]?.url || i.product?.variants[0]?.sampleImage,
        })),
      })),
    }));
  }

  /**
   * Store Owner: View sub-orders received by authenticated owner's store
   */
  async getStoreSubOrders(ownerId: string, storeId: string) {
    // Verify store ownership
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== ownerId) throw new ForbiddenException('You do not own this store');

    const subOrders = await this.prisma.storeOrder.findMany({
      where: { storeId },
      include: {
        order: {
          select: {
            orderNumber: true,
            shippingAddress: true,
            paymentMethod: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            milestones: { orderBy: { recordedAt: 'asc' } },
            product: {
              select: {
                media: { take: 1, select: { url: true } },
                variants: { take: 1, select: { sampleImage: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subOrders.map((so) => ({
      id: so.id,
      subOrderNumber: so.subOrderNumber,
      parentOrderNumber: so.order.orderNumber,
      status: so.status,
      rejectionReason: so.rejectionReason,
      subtotal: so.subtotalPaise / 100,
      tailoringFee: so.tailoringFeePaise / 100,
      total: so.totalPaise / 100,
      createdAt: so.createdAt,
      shippingAddress: so.order.shippingAddress,
      paymentMethod: so.order.paymentMethod,
      paymentStatus: so.order.paymentStatus,
      items: so.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        colorName: i.colorName,
        size: i.size,
        quantity: i.quantity,
        isCustomSized: i.isCustomSized,
        measurements: i.measurementsSnapshot,
        monogramInitials: i.monogramInitials,
        customizationNotes: i.customizationNotes,
        unitPrice: i.unitPricePaise / 100,
        tailoringFee: i.tailoringFeePaise / 100,
        status: i.status,
        image: i.product?.media[0]?.url || i.product?.variants[0]?.sampleImage,
        milestones: i.milestones,
      })),
    }));
  }

  /**
   * Store Owner: Update sub-order status (Accept, Reject, Production, Ready to Ship, Shipped, Delivered)
   */
  async updateSubOrderStatus(
    ownerId: string,
    storeId: string,
    subOrderId: string,
    input: UpdateSubOrderStatusInput,
  ) {
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== ownerId) throw new ForbiddenException('You do not own this store');

    const subOrder = await this.prisma.storeOrder.findFirst({
      where: { id: subOrderId, storeId },
      include: { items: true, order: true },
    });

    if (!subOrder) {
      throw new NotFoundException(`Sub-order not found: ${subOrderId}`);
    }

    const newStatus = input.status;

    // Milestone descriptions based on status
    let milestoneType: MilestoneType = MilestoneType.MATERIALS_READY;
    let milestoneTitle = 'Status Updated';
    let milestoneDesc = input.note || `Atelier marked sub-order as ${newStatus}`;

    switch (newStatus) {
      case FulfilmentStatus.ACCEPTED:
        milestoneType = MilestoneType.MATERIALS_READY;
        milestoneTitle = 'Order Accepted by Artisan';
        milestoneDesc = `Atelier confirmed capacity and reserved authentic raw fabrics.`;
        break;
      case FulfilmentStatus.IN_PRODUCTION:
        milestoneType = MilestoneType.EMBROIDERY_BLOCKPRINT_DONE;
        milestoneTitle = 'Craftwork in Progress';
        milestoneDesc = `Master artisans began weaving, block printing, and custom tailoring.`;
        break;
      case FulfilmentStatus.QC_PASSED:
        milestoneType = MilestoneType.QC_PASSED;
        milestoneTitle = 'Quality Control Passed';
        milestoneDesc = `Garment inspected for authentic stitch count, hem finishing, and measurements.`;
        break;
      case FulfilmentStatus.READY_TO_SHIP:
        milestoneType = MilestoneType.READY_FOR_DISPATCH;
        milestoneTitle = 'Bespoke Packaging Complete';
        milestoneDesc = `Carefully packaged in plastic-free eco butter paper and sealed with studio stamp.`;
        break;
      case FulfilmentStatus.SHIPPED:
        milestoneType = MilestoneType.READY_FOR_DISPATCH;
        milestoneTitle = 'Dispatched from Atelier';
        milestoneDesc = `Handed over to regional postal courier with verified tracking.`;
        break;
      case FulfilmentStatus.DELIVERED:
        milestoneType = MilestoneType.READY_FOR_DISPATCH;
        milestoneTitle = 'Delivered to Patron';
        milestoneDesc = `Successfully delivered to destination address.`;
        break;
      case FulfilmentStatus.REJECTED:
        milestoneTitle = 'Order Declined by Atelier';
        milestoneDesc = input.rejectionReason || 'Atelier unable to fulfill request at this time.';
        break;
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Sub-Order
      const updatedSubOrder = await tx.storeOrder.update({
        where: { id: subOrderId },
        data: {
          status: newStatus,
          rejectionReason: input.rejectionReason || null,
        },
      });

      // 2. Update all OrderItems in this sub-order
      for (const item of subOrder.items) {
        await tx.orderItem.update({
          where: { id: item.id },
          data: { status: newStatus },
        });

        // Add milestone
        await tx.productionMilestone.create({
          data: {
            orderItemId: item.id,
            type: milestoneType,
            title: milestoneTitle,
            description: milestoneDesc,
          },
        });
      }

      // 3. Check if all sub-orders of the parent order are delivered or completed
      const allSubOrders = await tx.storeOrder.findMany({
        where: { orderId: subOrder.orderId },
      });

      const allDelivered = allSubOrders.every((so) => so.status === FulfilmentStatus.DELIVERED);
      if (allDelivered) {
        await tx.order.update({
          where: { id: subOrder.orderId },
          data: { status: OrderStatus.DELIVERED },
        });
      }

      return {
        message: `Sub-order ${subOrder.subOrderNumber} updated to status '${newStatus}'`,
        subOrder: updatedSubOrder,
      };
    });
  }

  private formatOrder(order: any) {
    const formattedSubOrders =
      order.storeOrders?.map((so: any) => ({
        id: so.id,
        subOrderNumber: so.subOrderNumber,
        artisanId: so.storeId || so.store?.id,
        storeId: so.storeId || so.store?.id,
        status: so.status,
        rejectionReason: so.rejectionReason,
        total: so.totalPaise / 100,
        store: so.store
          ? {
              id: so.store.id,
              studioName: so.store.studioName,
              name: so.store.name,
              craft: so.store.craft,
              location: so.store.location,
            }
          : null,
        items: so.items?.map((item: any) => ({
          id: item.id,
          productName: item.productName,
          productId: item.productId,
          colorName: item.colorName,
          size: item.size,
          quantity: item.quantity,
          isCustomSized: item.isCustomSized,
          measurements: item.measurementsSnapshot,
          monogramInitials: item.monogramInitials,
          customizationNotes: item.customizationNotes,
          unitPrice: item.unitPricePaise / 100,
          tailoringFee: item.tailoringFeePaise / 100,
          status: item.status,
          image: item.product?.media?.[0]?.url || item.product?.variants?.[0]?.sampleImage,
          milestones: item.milestones?.map((m: any) => ({
            type: m.type,
            title: m.title,
            description: m.description,
            recordedAt: m.recordedAt,
          })),
        })),
      })) || [];

    return {
      orderNumber: order.orderNumber,
      orderId: order.orderNumber,
      id: order.id,
      status: order.status,
      totals: {
        subtotal: order.subtotalPaise / 100,
        tailoringTotal: order.tailoringTotalPaise / 100,
        shippingFee: order.shippingFeePaise / 100,
        discount: order.discountPaise / 100,
        grandTotal: order.grandTotalPaise / 100,
      },
      couponCode: order.couponCode,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      storeOrders: formattedSubOrders,
      subOrders: formattedSubOrders,
      createdAt: order.createdAt,
    };
  }
}
