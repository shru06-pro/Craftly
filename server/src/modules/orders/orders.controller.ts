import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService, CheckoutSessionInput } from './orders.service.js';

@ApiTags('Orders & Checkout')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create an order with price snapshot and artisan split fulfilments' })
  @ApiResponse({ status: 201, description: 'Order created with unique CRF-IN-XXXXXX order number' })
  async createCheckout(@Body() body: CheckoutSessionInput) {
    return this.ordersService.createCheckoutSession(body);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Track an order and its artisan production milestones' })
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }
}
