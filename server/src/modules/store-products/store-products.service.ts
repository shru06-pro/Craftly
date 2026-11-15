import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductStatus, StoreStatus } from '@prisma/client';

import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class VariantInput {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  colorName?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  colorHex?: string;

  @IsOptional()
  @IsString()
  sampleImage?: string;

  @IsOptional()
  @IsBoolean()
  isPhotographedSample?: boolean;

  @IsOptional()
  @IsArray()
  availableSizes?: string[];

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}

export class MediaInput {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateProductInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  craftDetails?: string;

  @IsOptional()
  @IsString()
  materials?: string;

  @IsString()
  categoryId!: string;

  @IsNumber()
  basePrice!: number; // in INR

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number; // in INR

  @IsOptional()
  @IsBoolean()
  allowsCustomMeasurements?: boolean;

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @IsOptional()
  @IsNumber()
  tailoringFee?: number; // in INR

  @IsOptional()
  @IsNumber()
  leadTimeMinDays?: number;

  @IsOptional()
  @IsNumber()
  leadTimeMaxDays?: number;

  @IsOptional()
  @IsNumber()
  leadTimeDays?: number;

  @IsOptional()
  @IsArray()
  variants?: VariantInput[];

  @IsOptional()
  @IsArray()
  media?: MediaInput[];

  @IsOptional()
  @IsArray()
  images?: string[];
}

export class UpdateProductInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  craftDetails?: string;

  @IsOptional()
  @IsString()
  materials?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsBoolean()
  allowsCustomMeasurements?: boolean;

  @IsOptional()
  @IsNumber()
  tailoringFee?: number;

  @IsOptional()
  @IsNumber()
  leadTimeMinDays?: number;

  @IsOptional()
  @IsNumber()
  leadTimeMaxDays?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  variants?: VariantInput[];

  @IsOptional()
  @IsArray()
  media?: MediaInput[];
}

@Injectable()
export class StoreProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Verify store ownership and approved status
   */
  private async verifyStoreOwnership(ownerId: string, storeId: string) {
    const store = await this.prisma.artisan.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store not found: ${storeId}`);
    }

    if (store.ownerId !== ownerId) {
      throw new ForbiddenException(`Access denied: You do not own this store`);
    }

    if (store.status !== StoreStatus.APPROVED) {
      throw new ForbiddenException(
        `Cannot manage products. Store application status is '${store.status}'. Only approved stores can list products.`,
      );
    }

    return store;
  }

  /**
   * List all products for a specific owned store
   */
  async getStoreProducts(ownerId: string, storeId: string) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const products = await this.prisma.product.findMany({
      where: { artisanId: storeId },
      include: {
        category: true,
        variants: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      craftDetails: p.craftDetails,
      materials: p.materials,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      price: p.basePricePaise / 100,
      compareAtPrice: p.compareAtPricePaise ? p.compareAtPricePaise / 100 : null,
      allowsCustomMeasurements: p.allowsCustomMeasurements,
      tailoringFee: p.tailoringFeePaise / 100,
      leadTimeMinDays: p.leadTimeMinDays,
      leadTimeMaxDays: p.leadTimeMaxDays,
      isAvailable: p.isAvailable,
      status: p.status,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      totalStock: p.variants.reduce((acc, v) => acc + v.stockQuantity, 0),
      variants: p.variants.map((v) => ({
        id: v.id,
        colorName: v.colorName,
        colorHex: v.colorHex,
        sampleImage: v.sampleImage,
        availableSizes: v.availableSizes,
        stockQuantity: v.stockQuantity,
        inStock: v.inStock && v.stockQuantity > 0,
        sku: v.sku,
      })),
      media: p.media,
      createdAt: p.createdAt,
    }));
  }

  /**
   * Get single product for editing
   */
  async getStoreProductById(ownerId: string, storeId: string, productId: string) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const product = await this.prisma.product.findFirst({
      where: { id: productId, artisanId: storeId },
      include: {
        category: true,
        variants: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product not found in this store: ${productId}`);
    }

    return {
      ...product,
      price: product.basePricePaise / 100,
      compareAtPrice: product.compareAtPricePaise ? product.compareAtPricePaise / 100 : null,
      tailoringFee: product.tailoringFeePaise / 100,
    };
  }

  /**
   * Create a new product with variants and media
   */
  async createProduct(ownerId: string, storeId: string, input: CreateProductInput) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const productName = (input.name || input.title || '').trim();
    if (!productName || !input.description || !input.categoryId || !input.basePrice) {
      throw new BadRequestException('Product name/title, description, category, and base price are required');
    }

    // Generate unique slug
    const baseSlug = (input.slug || productName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const productId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const basePricePaise = Math.round(input.basePrice * 100);
    const compareAtPricePaise = input.compareAtPrice ? Math.round(input.compareAtPrice * 100) : null;
    const tailoringFeePaise = input.tailoringFee ? Math.round(input.tailoringFee * 100) : 35000;

    const variantsData = (input.variants && input.variants.length > 0)
      ? input.variants.map((v) => {
          const stock = v.stockQuantity !== undefined ? v.stockQuantity : 10;
          return {
            colorName: (v.colorName || v.color || v.name || 'Natural Unbleached').trim(),
            colorHex: v.colorHex || '#FAF6EE',
            sampleImage: v.sampleImage || '/images/chikankari/ivory.jpg',
            isPhotographedSample: v.isPhotographedSample ?? true,
            availableSizes: v.availableSizes || (v.size ? [v.size] : ['Standard']),
            stockQuantity: stock,
            inStock: stock > 0,
            sku: v.sku || null,
          };
        })
      : [
          {
            colorName: 'Standard Atelier Fit',
            colorHex: '#FAF6EE',
            sampleImage: '/images/chikankari/ivory.jpg',
            isPhotographedSample: true,
            availableSizes: ['Free Size'],
            stockQuantity: 10,
            inStock: true,
            sku: `SKU-${Date.now().toString().slice(-4)}`,
          },
        ];

    const mediaData = (input.media && input.media.length > 0)
      ? input.media.map((m, idx) => ({
          url: m.url,
          altText: m.altText || productName,
          sortOrder: m.sortOrder ?? idx + 1,
        }))
      : (input.images && input.images.length > 0)
      ? input.images.map((url, idx) => ({
          url,
          altText: productName,
          sortOrder: idx + 1,
        }))
      : [];

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          id: productId,
          slug,
          name: productName,
          tagline: input.tagline || null,
          description: input.description.trim(),
          craftDetails: input.craftDetails || null,
          materials: input.materials || null,
          artisanId: storeId,
          categoryId: input.categoryId,
          basePricePaise,
          compareAtPricePaise,
          allowsCustomMeasurements: input.allowsCustomMeasurements ?? input.isCustomizable ?? true,
          tailoringFeePaise,
          leadTimeMinDays: input.leadTimeMinDays || input.leadTimeDays || 4,
          leadTimeMaxDays: input.leadTimeMaxDays || input.leadTimeDays || 7,
          status: ProductStatus.LIVE,
          isAvailable: true,
          variants: { create: variantsData },
          media: { create: mediaData },
        },
        include: {
          variants: true,
          media: true,
          category: true,
        },
      });

      return {
        message: 'Product created successfully and published to Craftly marketplace',
        ...product,
        title: product.name,
        product,
      };
    });
  }

  /**
   * Update product, variants, and media
   */
  async updateProduct(ownerId: string, storeId: string, productId: string, input: UpdateProductInput) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, artisanId: storeId },
    });
    if (!existing) {
      throw new NotFoundException(`Product not found in this store: ${productId}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Update core fields
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          name: input.name?.trim(),
          tagline: input.tagline,
          description: input.description?.trim(),
          craftDetails: input.craftDetails,
          materials: input.materials,
          categoryId: input.categoryId,
          basePricePaise: input.basePrice ? Math.round(input.basePrice * 100) : undefined,
          compareAtPricePaise: input.compareAtPrice !== undefined ? (input.compareAtPrice ? Math.round(input.compareAtPrice * 100) : null) : undefined,
          allowsCustomMeasurements: input.allowsCustomMeasurements,
          tailoringFeePaise: input.tailoringFee !== undefined ? Math.round(input.tailoringFee * 100) : undefined,
          leadTimeMinDays: input.leadTimeMinDays,
          leadTimeMaxDays: input.leadTimeMaxDays,
          isAvailable: input.isAvailable,
          status: input.status,
        },
      });

      // Update or replace variants if provided
      if (input.variants && input.variants.length > 0) {
        for (const v of input.variants) {
          const stock = v.stockQuantity ?? 10;
          const colorName = v.colorName || v.color || v.name || 'Natural';
          const colorHex = v.colorHex || '#FAF6EE';
          const sampleImage = v.sampleImage || '/images/chikankari/ivory.jpg';
          const sizes = v.availableSizes || (v.size ? [v.size] : ['Standard']);

          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                colorName,
                colorHex,
                sampleImage,
                availableSizes: sizes,
                stockQuantity: stock,
                inStock: stock > 0,
                sku: v.sku,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId,
                colorName,
                colorHex,
                sampleImage,
                availableSizes: sizes,
                stockQuantity: stock,
                inStock: stock > 0,
                sku: v.sku || null,
              },
            });
          }
        }
      }

      return {
        message: 'Product updated successfully',
        product: updated,
      };
    });
  }

  /**
   * Delete / Archive product
   */
  async deleteProduct(ownerId: string, storeId: string, productId: string) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, artisanId: storeId },
    });
    if (!existing) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }

    // Safely delete or archive if order history exists
    const orderItemsCount = await this.prisma.orderItem.count({
      where: { productId },
    });

    if (orderItemsCount > 0) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { status: ProductStatus.ARCHIVED, isAvailable: false },
      });
      return { message: 'Product archived successfully (preserved for historical orders)' };
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Product deleted permanently' };
  }

  /**
   * Quick update inventory / stock for a variant
   */
  async updateVariantStock(ownerId: string, storeId: string, variantId: string, stockQuantity: number) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.product.artisanId !== storeId) {
      throw new NotFoundException('Variant not found in this store');
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stockQuantity: Math.max(0, stockQuantity),
        inStock: stockQuantity > 0,
      },
    });

    return {
      message: 'Stock quantity updated successfully',
      variant: updated,
    };
  }
}
