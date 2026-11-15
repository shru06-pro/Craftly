import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  OrdersService,
  CheckoutSessionInput,
  UpdateSubOrderStatusInput,
} from './orders.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { StoreOwnershipGuard } from '../../common/guards/store-ownership.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Orders & Multi-Vendor Fulfilment')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders/checkout')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Multi-store checkout session: atomically validates stock, creates parent order and store sub-orders',
  })
  @ApiResponse({ status: 201, description: 'Order created with unique CRF-IN-XXXXXX order number and store sub-orders' })
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser | null,
    @Body() body: CheckoutSessionInput,
  ) {
    return this.ordersService.createCheckoutSession(body, user?.id);
  }

  @Get('orders/my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: List all parent orders with sub-order statuses' })
  async getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getCustomerOrders(user.id);
  }

  @Get('orders/:orderNumber')
  @ApiOperation({ summary: 'Public/Customer: Track an order and its artisan production milestones' })
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }

  @Get('store-owner/stores/:storeId/orders')
  @UseGuards(JwtAuthGuard, RolesGuard, StoreOwnershipGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Get all incoming sub-orders for authenticated owner’s store' })
  async getStoreSubOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
  ) {
    return this.ordersService.getStoreSubOrders(user.id, storeId);
  }

  @Patch('store-owner/stores/:storeId/orders/:subOrderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard, StoreOwnershipGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Accept, reject, or advance sub-order status with production milestone' })
  async updateSubOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('subOrderId') subOrderId: string,
    @Body() body: UpdateSubOrderStatusInput,
  ) {
    return this.ordersService.updateSubOrderStatus(user.id, storeId, subOrderId, body);
  }

  @Put('store-owner/stores/:storeId/orders/:subOrderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard, StoreOwnershipGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Accept, reject, or advance sub-order status (PUT alias)' })
  async updateSubOrderStatusPut(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('subOrderId') subOrderId: string,
    @Body() body: UpdateSubOrderStatusInput,
  ) {
    return this.ordersService.updateSubOrderStatus(user.id, storeId, subOrderId, body);
  }
}
