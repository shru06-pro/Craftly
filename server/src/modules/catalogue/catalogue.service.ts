import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export class ProductQueryDto {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  customizable?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(query: ProductQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'LIVE',
    };

    if (query.category && query.category !== 'all') {
      where.category = { slug: query.category };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { craftDetails: { contains: query.search, mode: 'insensitive' } },
        { materials: { contains: query.search, mode: 'insensitive' } },
        { artisan: { name: { contains: query.search, mode: 'insensitive' } } },
        { artisan: { craft: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.customizable !== undefined) {
      where.allowsCustomMeasurements = query.customizable;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePricePaise = {};
      if (query.minPrice !== undefined) {
        where.basePricePaise.gte = query.minPrice * 100;
      }
      if (query.maxPrice !== undefined) {
        where.basePricePaise.lte = query.maxPrice * 100;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { basePricePaise: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { basePricePaise: 'desc' };
    } else if (query.sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          artisan: true,
          category: true,
          variants: true,
          media: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(this.formatProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        artisan: true,
        category: true,
        variants: true,
        media: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      // Fallback search by ID if slug not matched directly
      const byId = await this.prisma.product.findUnique({
        where: { id: slug },
        include: {
          artisan: true,
          category: true,
          variants: true,
          media: { orderBy: { sortOrder: 'asc' } },
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!byId) {
        throw new NotFoundException(`Product not found with slug or ID: ${slug}`);
      }
      return this.formatProduct(byId);
    }

    return this.formatProduct(product);
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { status: 'LIVE' } } },
        },
      },
    });
  }

  async getArtisans() {
    return this.prisma.artisan.findMany({
      where: { verified: true },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    });
  }

  async getArtisanById(id: string) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: 'LIVE' },
          include: { variants: true, media: true },
        },
      },
    });

    if (!artisan) {
      throw new NotFoundException(`Artisan not found with ID: ${id}`);
    }

    return artisan;
  }

  private formatProduct(prod: any) {
    return {
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      tagline: prod.tagline,
      description: prod.description,
      craftDetails: prod.craftDetails,
      materials: prod.materials,
      price: prod.basePricePaise / 100,
      pricePaise: prod.basePricePaise,
      compareAtPrice: prod.compareAtPricePaise ? prod.compareAtPricePaise / 100 : null,
      rating: prod.rating,
      reviewsCount: prod.reviewsCount,
      allowsCustomMeasurements: prod.allowsCustomMeasurements,
      tailoringFee: prod.tailoringFeePaise / 100,
      tailoringFeePaise: prod.tailoringFeePaise,
      leadTime: `${prod.leadTimeMinDays}-${prod.leadTimeMaxDays} business days`,
      leadTimeMinDays: prod.leadTimeMinDays,
      leadTimeMaxDays: prod.leadTimeMaxDays,
      category: prod.category?.slug,
      categoryName: prod.category?.name,
      image: prod.media?.[0]?.url || prod.variants?.[0]?.sampleImage,
      artisan: prod.artisan
        ? {
            id: prod.artisan.id,
            name: prod.artisan.name,
            studio: prod.artisan.studioName,
            craft: prod.artisan.craft,
            location: prod.artisan.location,
            state: prod.artisan.state,
            avatar: prod.artisan.avatarUrl,
            badge: prod.artisan.badge,
          }
        : null,
      colorVariants: prod.variants?.map((v: any) => ({
        name: v.colorName,
        hex: v.colorHex,
        image: v.sampleImage,
        isPhotographedSample: v.isPhotographedSample,
        availableSizes: v.availableSizes,
      })),
      availableSizes: prod.variants?.[0]?.availableSizes || ['Standard'],
      reviews: prod.reviews,
    };
  }
}
