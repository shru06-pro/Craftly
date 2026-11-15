import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CustomizationRequestStatus, StoreStatus } from '@prisma/client';

import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateCustomizationRequestInput {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsArray()
  referenceImages?: string[];

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsString()
  orderItemId?: string;
}

export class UpdateCustomizationStatusInput {
  @IsString()
  status!: CustomizationRequestStatus;

  @IsOptional()
  @IsString()
  storeOwnerResponse?: string;

  @IsOptional()
  @IsString()
  artisanNotes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  clarificationMessage?: string;

  @IsOptional()
  @IsNumber()
  quotedPrice?: number; // in INR
}

@Injectable()
export class CustomizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Customer: Submit a special customization request
   */
  async createRequest(userId: string, input: CreateCustomizationRequestInput) {
    if (!input.productId) {
      throw new BadRequestException('Product ID is required');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: input.productId },
      include: { artisan: true },
    });

    if (!product) {
      throw new NotFoundException(`Product not found: ${input.productId}`);
    }

    const title = (input.title || product.name || 'Bespoke Customization').trim();
    const desc = (input.description || input.requirements || input.customerNotes || 'Custom specifications requested.').trim();

    const request = await this.prisma.customizationRequest.create({
      data: {
        productId: product.id,
        storeId: product.artisanId,
        userId,
        title,
        description: desc,
        referenceImages: input.referenceImages || [],
        customerNotes: input.customerNotes?.trim() || null,
        orderItemId: input.orderItemId || null,
        status: CustomizationRequestStatus.PENDING,
      },
      include: {
        product: { select: { id: true, name: true, basePricePaise: true } },
        store: { select: { id: true, studioName: true, name: true } },
      },
    });

    return {
      message: 'Your bespoke customization inquiry has been sent directly to the artisan atelier.',
      ...request,
      status: 'SUBMITTED',
      dbStatus: request.status,
      request: {
        ...request,
        status: 'SUBMITTED',
        productPrice: request.product.basePricePaise / 100,
      },
    };
  }

  /**
   * Customer: Get all customization requests submitted by authenticated customer
   */
  async getCustomerRequests(userId: string) {
    const requests = await this.prisma.customizationRequest.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePricePaise: true,
            media: { take: 1, select: { url: true } },
            variants: { take: 1, select: { sampleImage: true } },
          },
        },
        store: { select: { id: true, studioName: true, craft: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      referenceImages: r.referenceImages,
      customerNotes: r.customerNotes,
      storeOwnerResponse: r.storeOwnerResponse,
      rejectionReason: r.rejectionReason,
      clarificationMessage: r.clarificationMessage,
      quotedPrice: r.quotedPricePaise ? r.quotedPricePaise / 100 : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      product: {
        id: r.product.id,
        name: r.product.name,
        price: r.product.basePricePaise / 100,
        image: r.product.media[0]?.url || r.product.variants[0]?.sampleImage,
      },
      store: r.store,
    }));
  }

  /**
   * Store Owner: Get all customization requests received by a specific owned store
   */
  async getStoreRequests(ownerId: string, storeId: string) {
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== ownerId) throw new ForbiddenException('You do not own this store');

    const requests = await this.prisma.customizationRequest.findMany({
      where: { storeId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        product: {
          select: {
            id: true,
            name: true,
            basePricePaise: true,
            media: { take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      referenceImages: r.referenceImages,
      customerNotes: r.customerNotes,
      storeOwnerResponse: r.storeOwnerResponse,
      rejectionReason: r.rejectionReason,
      clarificationMessage: r.clarificationMessage,
      quotedPrice: r.quotedPricePaise ? r.quotedPricePaise / 100 : null,
      customer: r.user,
      product: {
        id: r.product.id,
        name: r.product.name,
        price: r.product.basePricePaise / 100,
        image: r.product.media[0]?.url,
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Store Owner: Accept, reject, or request clarification on a customization request
   */
  async updateRequestStatus(
    ownerId: string,
    storeId: string,
    requestId: string,
    input: UpdateCustomizationStatusInput,
  ) {
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== ownerId) throw new ForbiddenException('You do not own this store');

    const request = await this.prisma.customizationRequest.findFirst({
      where: { id: requestId, storeId },
    });
    if (!request) {
      throw new NotFoundException('Customization request not found in this store');
    }

    const storeResponse = (input.storeOwnerResponse || input.artisanNotes || '').trim();
    const updated = await this.prisma.customizationRequest.update({
      where: { id: requestId },
      data: {
        status: input.status,
        storeOwnerResponse: storeResponse || request.storeOwnerResponse,
        rejectionReason: input.rejectionReason?.trim() || request.rejectionReason,
        clarificationMessage: input.clarificationMessage?.trim() || request.clarificationMessage,
        quotedPricePaise: input.quotedPrice ? Math.round(input.quotedPrice * 100) : request.quotedPricePaise,
      },
    });

    return {
      message: `Customization request updated to status '${input.status}'`,
      ...updated,
      quotedPrice: updated.quotedPricePaise ? updated.quotedPricePaise / 100 : null,
      request: updated,
    };
  }

  /**
   * Direct respond to request by requestId with owner verification
   */
  async respondToRequest(ownerId: string, requestId: string, input: UpdateCustomizationStatusInput) {
    const request = await this.prisma.customizationRequest.findUnique({
      where: { id: requestId },
      include: { store: true },
    });
    if (!request) {
      throw new NotFoundException('Customization request not found');
    }
    if (request.store.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own the atelier associated with this request');
    }

    return this.updateRequestStatus(ownerId, request.storeId, requestId, input);
  }
}
