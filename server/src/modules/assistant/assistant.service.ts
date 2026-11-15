import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export class AssistantQueryDto {
  query!: string;
}

@Injectable()
export class AssistantService {
  constructor(private readonly prisma: PrismaService) {}

  async processQuery(dto: AssistantQueryDto) {
    const rawQuery = (dto.query || '').trim().toLowerCase();

    // 1. Detect Intent & Price Constraints
    let maxPriceRs: number | null = null;
    const priceMatch = rawQuery.match(/under\s*(?:rs\.?|₹)?\s*(\d+)/i) ||
                       rawQuery.match(/below\s*(?:rs\.?|₹)?\s*(\d+)/i) ||
                       rawQuery.match(/less\s*than\s*(?:rs\.?|₹)?\s*(\d+)/i);
    if (priceMatch) {
      maxPriceRs = parseInt(priceMatch[1], 10);
    }

    // 2. Detect Category
    let categorySlug: string | null = null;
    if (rawQuery.includes('kurta') || rawQuery.includes('apparel') || rawQuery.includes('dress') || rawQuery.includes('clothes')) {
      categorySlug = 'apparel';
    } else if (rawQuery.includes('leather') || rawQuery.includes('bag') || rawQuery.includes('tote')) {
      categorySlug = 'leather';
    } else if (rawQuery.includes('jewelry') || rawQuery.includes('jewellery') || rawQuery.includes('jhumka') || rawQuery.includes('silver')) {
      categorySlug = 'jewelry';
    } else if (rawQuery.includes('saree') || rawQuery.includes('stole') || rawQuery.includes('textile') || rawQuery.includes('silk')) {
      categorySlug = 'accessories';
    } else if (rawQuery.includes('pottery') || rawQuery.includes('cup') || rawQuery.includes('kulhad') || rawQuery.includes('clay') || rawQuery.includes('home')) {
      categorySlug = 'home';
    }

    // 3. Detect Craft or Techniques
    let craftKeyword: string | null = null;
    if (rawQuery.includes('chikankari')) craftKeyword = 'Chikankari';
    else if (rawQuery.includes('bagru') || rawQuery.includes('dabu')) craftKeyword = 'Bagru';
    else if (rawQuery.includes('santiniketan')) craftKeyword = 'Santiniketan';
    else if (rawQuery.includes('maheshwari')) craftKeyword = 'Maheshwari';
    else if (rawQuery.includes('tarakasi') || rawQuery.includes('filigree')) craftKeyword = 'Filigree';
    else if (rawQuery.includes('molela') || rawQuery.includes('terracotta')) craftKeyword = 'Terracotta';

    // 4. Query live database
    const where: any = { status: 'LIVE' };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (maxPriceRs) {
      where.basePricePaise = { lte: maxPriceRs * 100 };
    }
    if (craftKeyword) {
      where.OR = [
        { name: { contains: craftKeyword, mode: 'insensitive' } },
        { description: { contains: craftKeyword, mode: 'insensitive' } },
        { craftDetails: { contains: craftKeyword, mode: 'insensitive' } },
        { artisan: { craft: { contains: craftKeyword, mode: 'insensitive' } } },
      ];
    }

    const matches = await this.prisma.product.findMany({
      where,
      take: 4,
      include: {
        artisan: true,
        category: true,
        variants: true,
        media: true,
      },
      orderBy: { rating: 'desc' },
    });

    // Generate Craft Advisor narrative response
    let message = '';
    if (matches.length > 0) {
      if (craftKeyword && maxPriceRs) {
        message = `I located ${matches.length} authentic handcrafted ${craftKeyword} masterworks within your budget of ₹${maxPriceRs.toLocaleString('en-IN')}:`;
      } else if (craftKeyword) {
        message = `Here are our finest certified ${craftKeyword} atelier creations crafted by generational artisans:`;
      } else if (maxPriceRs) {
        message = `I found ${matches.length} bespoke handcrafted creations under ₹${maxPriceRs.toLocaleString('en-IN')}:`;
      } else if (categorySlug) {
        message = `Here are top-rated artisan pieces from our ${matches[0].category.name} collection:`;
      } else {
        message = `Based on your request, I recommend these heirloom artisanal pieces:`;
      }
    } else {
      message = `I couldn't find an exact match under those criteria right now, but here are our most beloved signature handcrafted pieces:`;
      const fallback = await this.prisma.product.findMany({
        where: { status: 'LIVE' },
        take: 3,
        include: { artisan: true, category: true, variants: true, media: true },
        orderBy: { rating: 'desc' },
      });
      matches.push(...fallback);
    }

    return {
      reply: message,
      products: matches.map((prod) => ({
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        price: prod.basePricePaise / 100,
        craft: prod.artisan?.craft,
        artisan: prod.artisan?.name,
        studio: prod.artisan?.studioName,
        rating: prod.rating,
        image: prod.media?.[0]?.url || prod.variants?.[0]?.sampleImage,
        allowsCustomMeasurements: prod.allowsCustomMeasurements,
      })),
    };
  }
}
