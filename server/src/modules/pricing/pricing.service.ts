import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export class CartLineInput {
  productId!: string;
  quantity!: number;
  isCustomSized?: boolean;
}

export class PriceQuoteRequest {
  items!: CartLineInput[];
  couponCode?: string;
  pincode?: string;
}

export interface PriceQuote {
  subtotalPaise: number;
  subtotalRupees: number;
  tailoringTotalPaise: number;
  tailoringTotalRupees: number;
  shippingFeePaise: number;
  shippingFeeRupees: number;
  discountPaise: number;
  discountRupees: number;
  gstPaise: number;
  gstRupees: number;
  grandTotalPaise: number;
  grandTotalRupees: number;
  couponApplied: {
    code: string;
    description: string;
  } | null;
  expiresAt: string;
}

@Injectable()
export class PricingService {
  private readonly FREE_SHIPPING_THRESHOLD_PAISE = 149900; // ₹1,499 in paise
  private readonly STANDARD_SHIPPING_FEE_PAISE = 9900; // ₹99 in paise
  private readonly GST_RATE = 0.05; // 5% GST for handloom apparel & crafts

  constructor(private readonly prisma: PrismaService) {}

  async calculateQuote(input: PriceQuoteRequest): Promise<PriceQuote> {
    if (!input.items || input.items.length === 0) {
      return {
        subtotalPaise: 0,
        subtotalRupees: 0,
        tailoringTotalPaise: 0,
        tailoringTotalRupees: 0,
        shippingFeePaise: 0,
        shippingFeeRupees: 0,
        discountPaise: 0,
        discountRupees: 0,
        gstPaise: 0,
        gstRupees: 0,
        grandTotalPaise: 0,
        grandTotalRupees: 0,
        couponApplied: null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    }

    const productIds = input.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotalPaise = 0;
    let tailoringTotalPaise = 0;

    for (const item of input.items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new BadRequestException(`Product not found: ${item.productId}`);
      }
      const qty = Math.max(1, item.quantity);
      subtotalPaise += prod.basePricePaise * qty;

      if (item.isCustomSized && prod.allowsCustomMeasurements) {
        tailoringTotalPaise += prod.tailoringFeePaise * qty;
      }
    }

    // Shipping rule: Free for cart subtotal >= ₹1,499
    const shippingFeePaise =
      subtotalPaise >= this.FREE_SHIPPING_THRESHOLD_PAISE
        ? 0
        : this.STANDARD_SHIPPING_FEE_PAISE;

    // Coupon discount calculation
    let discountPaise = 0;
    let couponApplied: { code: string; description: string } | null = null;

    if (input.couponCode) {
      const coupon = await this.validateCoupon(input.couponCode.trim().toUpperCase(), subtotalPaise);
      if (coupon.valid) {
        discountPaise = coupon.discountPaise;
        couponApplied = {
          code: coupon.code,
          description: coupon.description,
        };
      }
    }

    // Taxes (GST 5% included or calculated on net merchandise)
    const netTaxablePaise = Math.max(0, subtotalPaise - discountPaise);
    const gstPaise = Math.round(netTaxablePaise * this.GST_RATE);

    // Grand total
    const grandTotalPaise = Math.max(
      0,
      subtotalPaise + tailoringTotalPaise + shippingFeePaise - discountPaise,
    );

    return {
      subtotalPaise,
      subtotalRupees: subtotalPaise / 100,
      tailoringTotalPaise,
      tailoringTotalRupees: tailoringTotalPaise / 100,
      shippingFeePaise,
      shippingFeeRupees: shippingFeePaise / 100,
      discountPaise,
      discountRupees: discountPaise / 100,
      gstPaise,
      gstRupees: gstPaise / 100,
      grandTotalPaise,
      grandTotalRupees: grandTotalPaise / 100,
      couponApplied,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins quote validity
    };
  }

  async validateCoupon(code: string, subtotalPaise: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return { valid: false, code, message: 'Invalid or inactive coupon code', discountPaise: 0, description: '' };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, code, message: 'Coupon code has expired', discountPaise: 0, description: '' };
    }

    if (subtotalPaise < coupon.minCartValuePaise) {
      const minRs = coupon.minCartValuePaise / 100;
      return {
        valid: false,
        code,
        message: `Cart minimum of ₹${minRs.toLocaleString('en-IN')} required for this coupon`,
        discountPaise: 0,
        description: '',
      };
    }

    let discountPaise = 0;
    let description = '';

    if (coupon.discountType === 'PERCENTAGE') {
      discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
      if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
        discountPaise = coupon.maxDiscountPaise;
      }
      description = `${coupon.discountValue}% off up to ₹${(coupon.maxDiscountPaise || 0) / 100}`;
    } else {
      discountPaise = Math.min(coupon.discountValue, subtotalPaise);
      description = `Flat ₹${coupon.discountValue / 100} off`;
    }

    return {
      valid: true,
      code: coupon.code,
      discountPaise,
      discountRupees: discountPaise / 100,
      description,
      message: 'Coupon applied successfully',
    };
  }
}
