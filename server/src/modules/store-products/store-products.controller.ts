import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  StoreProductsService,
  CreateProductInput,
  UpdateProductInput,
} from './store-products.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { StoreOwnershipGuard } from '../../common/guards/store-ownership.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Store Owner Products & Inventory')
@Controller('store-owner/stores/:storeId')
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnershipGuard)
@Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class StoreProductsController {
  constructor(private readonly storeProductsService: StoreProductsService) {}

  @Get('products')
  @ApiOperation({ summary: 'List all products belonging to the store owner’s approved store' })
  async getStoreProducts(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
  ) {
    return this.storeProductsService.getStoreProducts(user.id, storeId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product with variants and media' })
  async createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Body() body: CreateProductInput,
  ) {
    return this.storeProductsService.createProduct(user.id, storeId, body);
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Get single product details for editing' })
  async getStoreProductById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.storeProductsService.getStoreProductById(user.id, storeId, productId);
  }

  @Put('products/:productId')
  @ApiOperation({ summary: 'Update product information, variants, and stock' })
  async updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() body: UpdateProductInput,
  ) {
    return this.storeProductsService.updateProduct(user.id, storeId, productId, body);
  }

  @Delete('products/:productId')
  @ApiOperation({ summary: 'Delete or archive a product' })
  async deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.storeProductsService.deleteProduct(user.id, storeId, productId);
  }

  @Put('inventory/variant/:variantId')
  @Patch('inventory/variant/:variantId')
  @Patch('products/:productId/variants/:variantId/stock')
  @ApiOperation({ summary: 'Quickly update variant inventory stock quantity' })
  async updateVariantStock(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
    @Body('stockQuantity') stockQuantity: number,
  ) {
    return this.storeProductsService.updateVariantStock(user.id, storeId, variantId, stockQuantity);
  }
}
