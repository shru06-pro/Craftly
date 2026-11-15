import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AdminService,
  CreateAdminDto,
  UpdateAdminRoleDto,
} from './admin.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AdminPermissionsGuard } from '../../common/guards/admin-permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role, StoreStatus, ProductStatus, UserStatus } from '@prisma/client';

@ApiTags('Platform Administration & Moderation')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Platform-wide sales, customer, store, and order analytics' })
  async getAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  @Get('store-applications')
  @ApiOperation({ summary: 'List store owner registration applications' })
  async getStoreApplications(@Query('status') status?: StoreStatus) {
    return this.adminService.getStoreApplications(status);
  }

  @Post('store-applications/:id/approve')
  @Patch('store-applications/:id/approve')
  @UseGuards(AdminPermissionsGuard)
  @RequirePermissions('stores:approve')
  @ApiOperation({ summary: 'Approve a store application and grant active store status' })
  async approveStore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.adminService.approveStore(id, user.id);
  }

  @Post('store-applications/:id/reject')
  @Patch('store-applications/:id/reject')
  @UseGuards(AdminPermissionsGuard)
  @RequirePermissions('stores:reject')
  @ApiOperation({ summary: 'Reject a store application with a recorded reason' })
  async rejectStore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectStore(id, user.id, reason);
  }

  @Get('stores')
  @ApiOperation({ summary: 'List all registered stores across the platform' })
  async getAllStores() {
    return this.adminService.getAllStores();
  }

  @Put('stores/:id/status')
  @Patch('stores/:id/status')
  @UseGuards(AdminPermissionsGuard)
  @RequirePermissions('stores:suspend')
  @ApiOperation({ summary: 'Suspend or activate a store' })
  async setStoreStatus(
    @Param('id') id: string,
    @Body('status') status: StoreStatus,
  ) {
    return this.adminService.setStoreStatus(id, status);
  }

  @Get('products')
  @ApiOperation({ summary: 'List all products across the marketplace for moderation' })
  async getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Put('products/:id/status')
  @Patch('products/:id/status')
  @UseGuards(AdminPermissionsGuard)
  @RequirePermissions('products:moderate')
  @ApiOperation({ summary: 'Moderate product status (LIVE, REVIEW, ARCHIVED, DRAFT)' })
  async setProductStatus(
    @Param('id') id: string,
    @Body('status') status: ProductStatus,
  ) {
    return this.adminService.setProductStatus(id, status);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Monitor all marketplace parent orders and store sub-orders' })
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('customers')
  @ApiOperation({ summary: 'List registered customer accounts and statistics' })
  async getCustomers() {
    return this.adminService.getCustomers();
  }

  @Put('customers/:id/status')
  @Patch('customers/:id/status')
  @UseGuards(AdminPermissionsGuard)
  @RequirePermissions('customers:manage')
  @ApiOperation({ summary: 'Activate or suspend customer account' })
  async setCustomerStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.adminService.setCustomerStatus(id, status);
  }

  // --- Super Admin Exclusive Management Endpoints ---

  @Get('admins')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: List all platform administrators' })
  async getAdmins() {
    return this.adminService.getAdmins();
  }

  @Get('administrators')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: Alias to list all platform administrators' })
  async getAdministrators() {
    return this.adminService.getAdmins();
  }

  @Post('admins')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: Create a new platform administrator' })
  async createAdmin(@Body() body: CreateAdminDto) {
    return this.adminService.createAdmin(body);
  }

  @Post('administrators')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: Alias to create a new platform administrator' })
  async createAdministrator(@Body() body: CreateAdminDto) {
    return this.adminService.createAdmin(body);
  }

  @Patch('admins/:id/role')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: Update administrator role and permissions' })
  async updateAdminRole(
    @Param('id') id: string,
    @Body() body: UpdateAdminRoleDto,
  ) {
    return this.adminService.updateAdminRole(id, body);
  }

  @Put('admins/:id/status')
  @Patch('admins/:id/status')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: Activate or deactivate administrator' })
  async setAdminStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.setAdminStatus(id, isActive);
  }

  @Put('administrators/:id/status')
  @Patch('administrators/:id/status')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin Only: Alias to set administrator status' })
  async setAdministratorStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.setAdminStatus(id, isActive);
  }
}
