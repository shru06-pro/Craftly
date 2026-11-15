import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService, CreateStoreInput, UpdateStoreInput } from './stores.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Public: List all approved local craft stores and ateliers' })
  async getPublicStores() {
    return this.storesService.getPublicStores();
  }

  @Get('my/stores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Get all stores owned by authenticated user' })
  async getMyStores(@CurrentUser() user: AuthenticatedUser) {
    return this.storesService.getMyStores(user.id);
  }

  @Post('my/stores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Register a new store application' })
  async createStoreApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateStoreInput,
  ) {
    return this.storesService.createStoreApplication(user.id, body);
  }

  @Get('my/stores/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Get details of an owned store' })
  async getMyStoreById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') storeId: string,
  ) {
    return this.storesService.getMyStoreById(user.id, storeId);
  }

  @Put('my/stores/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Update profile of an owned store' })
  async updateMyStore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') storeId: string,
    @Body() body: UpdateStoreInput,
  ) {
    return this.storesService.updateMyStore(user.id, storeId, body);
  }

  @Get('my/stores/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Store Owner: Get store-specific sales, revenue, and inventory analytics' })
  async getStoreAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') storeId: string,
  ) {
    return this.storesService.getStoreAnalytics(user.id, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public: Get store profile with all live products' })
  async getPublicStoreById(@Param('id') id: string) {
    return this.storesService.getPublicStoreById(id);
  }
}

