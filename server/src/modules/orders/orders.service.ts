import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PricingService } from '../pricing/pricing.service.js';
import { OrderStatus, PaymentMethod, PaymentStatus, FulfilmentStatus, MilestoneType } from '@prisma/client';

export class CheckoutItemInput {
  productId!: string;
  quantity!: number;
  colorName!: string;
  colorHex?: string;
  size!: string;
  isCustomSized?: boolean;
  customMeasurements?: any;
  monogramInitials?: string;
}

export class ShippingAddressInput {
  fullName!: string;
  phone!: string;
  pincode!: string;
  addressLine!: string;
  locality?: string;
  city!: string;
  state!: string;
}

export class CheckoutSessionInput {
  items!: CheckoutItemInput[];
  shippingAddress!: ShippingAddressInput;
  paymentMethod!: 'UPI' | 'NETBANKING' | 'CARD' | 'COD';
  couponCode?: string;
  idempotencyKey?: string;
  userId?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async createCheckoutSession(input: CheckoutSessionInput) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Checkout cart cannot be empty');
    }

    // Check for existing idempotent order
    if (input.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { items: { include: { milestones: true, artisan: true } } },
      });
      if (existing) {
        return this.formatOrder(existing);
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

    // Fetch product details for snapshotting
    const productIds = input.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { artisan: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Generate unique Indian order number CRF-IN-XXXXXX
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `CRF-IN-${randomSixDigits}`;

    const paymentMethodEnum = (PaymentMethod as any)[input.paymentMethod] || PaymentMethod.UPI;

    // Database transaction to create Order and OrderItems
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId: input.userId || null,
        status: input.paymentMethod === 'COD' ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT,
        subtotalPaise: quote.subtotalPaise,
        tailoringTotalPaise: quote.tailoringTotalPaise,
        shippingFeePaise: quote.shippingFeePaise,
        discountPaise: quote.discountPaise,
        grandTotalPaise: quote.grandTotalPaise,
        couponCode: quote.couponApplied?.code || null,
        paymentMethod: paymentMethodEnum,
        paymentStatus: input.paymentMethod === 'COD' ? PaymentStatus.AUTHORIZED : PaymentStatus.PENDING,
        shippingAddress: input.shippingAddress as any,
        idempotencyKey: input.idempotencyKey || null,
        items: {
          create: input.items.map((item) => {
            const prod = productMap.get(item.productId)!;
            const tailoringFeePaise = item.isCustomSized ? prod.tailoringFeePaise : 0;
            return {
              artisanId: prod.artisanId,
              productId: prod.id,
              productName: prod.name,
              colorName: item.colorName,
              size: item.size,
              isCustomSized: Boolean(item.isCustomSized),
              measurementsSnapshot: item.customMeasurements || null,
              monogramInitials: item.monogramInitials || null,
              unitPricePaise: prod.basePricePaise,
              tailoringFeePaise,
              quantity: item.quantity,
              status: FulfilmentStatus.AWAITING_ARTISAN,
              milestones: {
                create: [
                  {
                    type: MilestoneType.MATERIALS_READY,
                    title: 'Order Received by Atelier',
                    description: `Artisan studio ${prod.artisan.studioName} notified. Preparing natural-dye fabrics and thread.`,
                  },
                ],
              },
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            milestones: true,
            artisan: true,
          },
        },
      },
    });

    return this.formatOrder(order);
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            milestones: { orderBy: { recordedAt: 'asc' } },
            artisan: true,
            product: { include: { media: true, variants: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderNumber}`);
    }

    return this.formatOrder(order);
  }

  private formatOrder(order: any) {
    return {
      orderId: order.orderNumber,
      id: order.id,
      status: order.status,
      totals: {
        subtotal: order.subtotalPaise / 100,
        tailoringTotal: order.tailoringTotalPaise / 100,
        shippingFee: order.shippingFeePaise / 100,
        discount: order.discountPaise / 100,
        grandTotal: order.grandTotalPaise / 100,
        subtotalPaise: order.subtotalPaise,
        grandTotalPaise: order.grandTotalPaise,
      },
      couponCode: order.couponCode,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      items: order.items?.map((item: any) => ({
        id: item.id,
        productName: item.productName,
        productId: item.productId,
        colorName: item.colorName,
        size: item.size,
        quantity: item.quantity,
        isCustomSized: item.isCustomSized,
        measurements: item.measurementsSnapshot,
        monogramInitials: item.monogramInitials,
        unitPrice: item.unitPricePaise / 100,
        tailoringFee: item.tailoringFeePaise / 100,
        status: item.status,
        artisan: item.artisan
          ? {
              name: item.artisan.name,
              studio: item.artisan.studioName,
              location: item.artisan.location,
              craft: item.artisan.craft,
            }
          : null,
        milestones: item.milestones?.map((m: any) => ({
          type: m.type,
          title: m.title,
          description: m.description,
          recordedAt: m.recordedAt,
        })),
      })),
      createdAt: order.createdAt,
    };
  }
}
