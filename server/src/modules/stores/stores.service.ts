import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StoreStatus } from '@prisma/client';

import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStoreInput {
  @IsString()
  name!: string;

  @IsString()
  studioName!: string;

  @IsString()
  craft!: string;

  @IsString()
  location!: string;

  @IsString()
  state!: string;

  @IsString()
  bio!: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  storeEmail?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsNumber()
  leadTimeMinDays?: number;

  @IsOptional()
  @IsNumber()
  leadTimeMaxDays?: number;
}

export class UpdateStoreInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  studioName?: string;

  @IsOptional()
  @IsString()
  craft?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  storeEmail?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsNumber()
  leadTimeMinDays?: number;

  @IsOptional()
  @IsNumber()
  leadTimeMaxDays?: number;
}

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: List all approved stores
   */
  async getPublicStores() {
    const stores = await this.prisma.artisan.findMany({
      where: {
        status: StoreStatus.APPROVED,
      },
      include: {
        products: {
          where: { status: 'LIVE' },
          select: {
            id: true,
            name: true,
            basePricePaise: true,
            media: { take: 1, select: { url: true } },
            variants: { take: 1, select: { sampleImage: true } },
          },
        },
      },
      orderBy: { isFeatured: 'desc' },
    });

    return stores.map((s) => ({
      id: s.id,
      name: s.name,
      studioName: s.studioName,
      craft: s.craft,
      location: s.location,
      state: s.state,
      bio: s.bio,
      avatarUrl: s.avatarUrl,
      bannerUrl: s.bannerUrl,
      badge: s.badge,
      verified: s.verified,
      isFeatured: s.isFeatured,
      leadTimeMinDays: s.leadTimeMinDays,
      leadTimeMaxDays: s.leadTimeMaxDays,
      productCount: s.products.length,
      sampleProducts: s.products.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.basePricePaise / 100,
        image: p.media[0]?.url || p.variants[0]?.sampleImage,
      })),
    }));
  }

  /**
   * Public: Get store profile with all live products
   */
  async getPublicStoreById(id: string) {
    const store = await this.prisma.artisan.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: 'LIVE' },
          include: {
            category: true,
            media: { orderBy: { sortOrder: 'asc' } },
            variants: true,
          },
          orderBy: { rating: 'desc' },
        },
      },
    });

    if (!store || store.status !== StoreStatus.APPROVED) {
      throw new NotFoundException(`Store not found or currently not active`);
    }

    return {
      id: store.id,
      name: store.name,
      studioName: store.studioName,
      craft: store.craft,
      location: store.location,
      state: store.state,
      bio: store.bio,
      avatarUrl: store.avatarUrl,
      bannerUrl: store.bannerUrl,
      badge: store.badge,
      verified: store.verified,
      isFeatured: store.isFeatured,
      leadTimeMinDays: store.leadTimeMinDays,
      leadTimeMaxDays: store.leadTimeMaxDays,
      products: store.products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        craftDetails: p.craftDetails,
        materials: p.materials,
        category: p.category.name,
        categorySlug: p.category.slug,
        price: p.basePricePaise / 100,
        originalPrice: p.compareAtPricePaise ? p.compareAtPricePaise / 100 : null,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        allowsCustomMeasurements: p.allowsCustomMeasurements,
        tailoringFee: p.tailoringFeePaise / 100,
        image: p.media[0]?.url || p.variants[0]?.sampleImage,
        media: p.media,
        colorVariants: p.variants.map((v) => ({
          id: v.id,
          name: v.colorName,
          hex: v.colorHex,
          image: v.sampleImage,
          sizes: v.availableSizes,
          inStock: v.inStock && v.stockQuantity > 0,
        })),
      })),
    };
  }

  /**
   * Store Owner: Get all stores owned by authenticated user
   */
  async getMyStores(ownerId: string) {
    const stores = await this.prisma.artisan.findMany({
      where: { ownerId },
      include: {
        products: { select: { id: true } },
        applications: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stores.map((s) => ({
      id: s.id,
      studioName: s.studioName,
      name: s.name,
      craft: s.craft,
      location: s.location,
      state: s.state,
      status: s.status,
      rejectionReason: s.rejectionReason,
      avatarUrl: s.avatarUrl,
      bannerUrl: s.bannerUrl,
      productCount: s.products.length,
      appliedAt: s.appliedAt,
      approvedAt: s.approvedAt,
      latestApplication: s.applications[0] || null,
    }));
  }

  /**
   * Store Owner: Apply for a new store
   */
  async createStoreApplication(ownerId: string, input: CreateStoreInput) {
    const storeId = `store-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return this.prisma.$transaction(async (tx) => {
      const store = await tx.artisan.create({
        data: {
          id: storeId,
          name: input.name.trim(),
          studioName: input.studioName.trim(),
          craft: input.craft.trim(),
          location: input.location.trim(),
          state: input.state.trim(),
          bio: input.bio.trim(),
          avatarUrl: input.avatarUrl || null,
          bannerUrl: input.bannerUrl || null,
          storeEmail: input.storeEmail || null,
          storePhone: input.storePhone || null,
          addressLine: input.addressLine || null,
          pincode: input.pincode || null,
          leadTimeMinDays: input.leadTimeMinDays || 4,
          leadTimeMaxDays: input.leadTimeMaxDays || 7,
          status: StoreStatus.PENDING,
          ownerId,
          verified: false,
          appliedAt: new Date(),
        },
      });

      const application = await tx.storeApplication.create({
        data: {
          storeId: store.id,
          ownerId,
          status: StoreStatus.PENDING,
          notes: `Store application for '${store.studioName}' submitted by owner.`,
        },
      });

      return {
        message: 'Store application submitted successfully. Our admin team will review it shortly.',
        store,
        application,
      };
    });
  }

  /**
   * Store Owner: Get single owned store with full details
   */
  async getMyStoreById(ownerId: string, storeId: string) {
    const store = await this.prisma.artisan.findUnique({
      where: { id: storeId },
      include: {
        products: {
          include: {
            variants: true,
            category: true,
          },
        },
        applications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store not found: ${storeId}`);
    }

    if (store.ownerId !== ownerId) {
      throw new ForbiddenException(`You do not have access to this store`);
    }

    return store;
  }

  /**
   * Store Owner: Update store profile
   */
  async updateMyStore(ownerId: string, storeId: string, input: UpdateStoreInput) {
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== ownerId) throw new ForbiddenException('You do not own this store');

    const updated = await this.prisma.artisan.update({
      where: { id: storeId },
      data: {
        name: input.name?.trim(),
        studioName: input.studioName?.trim(),
        craft: input.craft?.trim(),
        location: input.location?.trim(),
        state: input.state?.trim(),
        bio: input.bio?.trim(),
        avatarUrl: input.avatarUrl,
        bannerUrl: input.bannerUrl,
        storeEmail: input.storeEmail?.trim(),
        storePhone: input.storePhone?.trim(),
        addressLine: input.addressLine?.trim(),
        pincode: input.pincode?.trim(),
        leadTimeMinDays: input.leadTimeMinDays,
        leadTimeMaxDays: input.leadTimeMaxDays,
      },
    });

    return { message: 'Store profile updated successfully', store: updated };
  }

  /**
   * Store Owner: Store analytics (sales, orders, revenues, low-stock)
   */
  async getStoreAnalytics(ownerId: string, storeId: string) {
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== ownerId) throw new ForbiddenException('You do not own this store');

    // Aggregate sub-orders for this store
    const subOrders = await this.prisma.storeOrder.findMany({
      where: { storeId },
      include: {
        order: { select: { orderNumber: true, createdAt: true, paymentStatus: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalOrders = subOrders.length;
    const pendingOrders = subOrders.filter(
      (o) => o.status === 'AWAITING_ARTISAN' || o.status === 'ACCEPTED' || o.status === 'IN_PRODUCTION',
    ).length;
    const completedOrders = subOrders.filter((o) => o.status === 'DELIVERED').length;

    // Total sales in paise -> INR
    const totalSalesPaise = subOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
      .reduce((sum, o) => sum + o.totalPaise, 0);

    // Products & low stock items
    const products = await this.prisma.product.findMany({
      where: { artisanId: storeId },
      include: { variants: true },
    });

    const totalProducts = products.length;
    const lowStockVariants: any[] = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stockQuantity <= 5) {
          lowStockVariants.push({
            productId: p.id,
            productName: p.name,
            variantId: v.id,
            colorName: v.colorName,
            stockQuantity: v.stockQuantity,
          });
        }
      });
    });

    // Recent 5 sub-orders
    const recentOrders = subOrders.slice(0, 5).map((o) => ({
      id: o.id,
      subOrderNumber: o.subOrderNumber,
      orderNumber: o.order.orderNumber,
      total: o.totalPaise / 100,
      status: o.status,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    }));

    return {
      storeName: store.studioName,
      status: store.status,
      metrics: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales: totalSalesPaise / 100,
        totalProducts,
        lowStockCount: lowStockVariants.length,
      },
      lowStockVariants,
      recentOrders,
    };
  }
}
