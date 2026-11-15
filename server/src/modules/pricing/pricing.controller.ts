import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PricingService, PriceQuoteRequest } from './pricing.service.js';

@ApiTags('Pricing & Checkout')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('quote')
  @ApiOperation({ summary: 'Calculate server-authoritative price quote for cart items' })
  async calculateQuote(@Body() body: PriceQuoteRequest) {
    return this.pricingService.calculateQuote(body);
  }

  @Get('coupon/validate')
  @ApiOperation({ summary: 'Validate a coupon code against current cart subtotal' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'subtotalPaise', required: true, type: Number })
  async validateCoupon(
    @Query('code') code: string,
    @Query('subtotalPaise') subtotalPaise: number,
  ) {
    return this.pricingService.validateCoupon(code, Number(subtotalPaise) || 0);
  }
}
