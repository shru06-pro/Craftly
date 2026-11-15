import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Role, StoreStatus, ProductStatus, UserStatus, AdminRoleType } from '@prisma/client';

import { IsString, IsEmail, IsOptional, IsArray, IsBoolean, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  roleType?: AdminRoleType;

  @IsOptional()
  @IsString()
  role?: AdminRoleType;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdateAdminRoleDto {
  @IsOptional()
  @IsString()
  roleType?: AdminRoleType;

  @IsOptional()
  @IsString()
  role?: AdminRoleType;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin Analytics: Real platform metrics
   */
  async getPlatformAnalytics() {
    const [
      totalCustomers,
      totalStores,
      pendingApplications,
      approvedStores,
      totalProducts,
      totalOrders,
      orders,
      categories,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.artisan.count(),
      this.prisma.storeApplication.count({ where: { status: StoreStatus.PENDING } }),
      this.prisma.artisan.count({ where: { status: StoreStatus.APPROVED } }),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.findMany({
        select: { grandTotalPaise: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
    ]);

    const totalSalesPaise = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.grandTotalPaise, 0);

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        storeOrders: { include: { store: { select: { studioName: true } } } },
      },
    });

    const gmv = totalSalesPaise / 100;

    return {
      gmv,
      totalGMV: gmv,
      totalStores,
      totalCustomers,
      totalOrders,
      totalProducts,
      pendingApplications,
      approvedStores,
      metrics: {
        totalCustomers,
        totalStores,
        pendingApplications,
        approvedStores,
        totalProducts,
        totalOrders,
        totalGMV: gmv,
        gmv,
      },
      categoriesDistribution: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
      recentActivity: recentOrders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.user?.name || 'Patron',
        customerEmail: o.user?.email,
        total: o.grandTotalPaise / 100,
        status: o.status,
        stores: o.storeOrders.map((so) => so.store.studioName),
        createdAt: o.createdAt,
      })),
    };
  }

  /**
   * Store Applications: List applications
   */
  async getStoreApplications(status?: StoreStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const applications = await this.prisma.storeApplication.findMany({
      where,
      include: {
        store: true,
        owner: { select: { id: true, name: true, email: true, phone: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      storeId: app.storeId,
      status: app.status,
      notes: app.notes,
      rejectionReason: app.rejectionReason,
      reviewedAt: app.reviewedAt,
      reviewedBy: app.reviewedBy?.name,
      createdAt: app.createdAt,
      store: {
        id: app.store.id,
        studioName: app.store.studioName,
        name: app.store.name,
        craft: app.store.craft,
        location: app.store.location,
        state: app.store.state,
        bio: app.store.bio,
        storeEmail: app.store.storeEmail,
        storePhone: app.store.storePhone,
        addressLine: app.store.addressLine,
        pincode: app.store.pincode,
        avatarUrl: app.store.avatarUrl,
        bannerUrl: app.store.bannerUrl,
      },
      owner: app.owner,
    }));
  }

  /**
   * Store Application: Approve store
   */
  async approveStore(applicationId: string, adminUserId: string) {
    const app = await this.prisma.storeApplication.findUnique({
      where: { id: applicationId },
      include: { store: true, owner: true },
    });

    if (!app) {
      throw new NotFoundException('Store application not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update application record
      const updatedApp = await tx.storeApplication.update({
        where: { id: applicationId },
        data: {
          status: StoreStatus.APPROVED,
          reviewedById: adminUserId,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });

      // 2. Activate store
      const updatedStore = await tx.artisan.update({
        where: { id: app.storeId },
        data: {
          status: StoreStatus.APPROVED,
          verified: true,
          rejectionReason: null,
          approvedAt: new Date(),
        },
      });

      // 3. Ensure owner role is STORE_OWNER
      await tx.user.update({
        where: { id: app.ownerId },
        data: { role: Role.STORE_OWNER },
      });

      return {
        message: `Store '${updatedStore.studioName}' has been approved successfully. The owner now has active dashboard access.`,
        status: updatedApp.status,
        application: updatedApp,
        store: updatedStore,
      };
    });
  }

  /**
   * Store Application: Reject store with reason
   */
  async rejectStore(applicationId: string, adminUserId: string, reason: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('A reason must be provided when rejecting a store application.');
    }

    const app = await this.prisma.storeApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundException('Store application not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedApp = await tx.storeApplication.update({
        where: { id: applicationId },
        data: {
          status: StoreStatus.REJECTED,
          rejectionReason: reason.trim(),
          reviewedById: adminUserId,
          reviewedAt: new Date(),
        },
      });

      const updatedStore = await tx.artisan.update({
        where: { id: app.storeId },
        data: {
          status: StoreStatus.REJECTED,
          rejectionReason: reason.trim(),
        },
      });

      return {
        message: `Store application rejected. Reason logged for the owner.`,
        status: updatedApp.status,
        application: updatedApp,
        store: updatedStore,
      };
    });
  }

  /**
   * Store Management: Suspend / Activate store
   */
  async setStoreStatus(storeId: string, status: StoreStatus) {
    const store = await this.prisma.artisan.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');

    const updated = await this.prisma.artisan.update({
      where: { id: storeId },
      data: { status },
    });

    return {
      message: `Store '${updated.studioName}' status set to '${status}'`,
      store: updated,
    };
  }

  /**
   * Store Management: List all stores
   */
  async getAllStores() {
    const stores = await this.prisma.artisan.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true, subOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stores.map((s) => ({
      id: s.id,
      studioName: s.studioName,
      name: s.name,
      craft: s.craft,
      location: s.location,
      state: s.state,
      status: s.status,
      rejectionReason: s.rejectionReason,
      owner: s.owner,
      productCount: s._count.products,
      orderCount: s._count.subOrders,
      appliedAt: s.appliedAt,
      approvedAt: s.approvedAt,
    }));
  }

  /**
   * Product Moderation: List all products across marketplace
   */
  async getAllProducts() {
    const products = await this.prisma.product.findMany({
      include: {
        artisan: { select: { id: true, studioName: true, status: true } },
        category: { select: { id: true, name: true } },
        variants: true,
        media: { take: 1, select: { url: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      status: p.status,
      isAvailable: p.isAvailable,
      price: p.basePricePaise / 100,
      store: p.artisan.studioName,
      storeStatus: p.artisan.status,
      category: p.category.name,
      totalStock: p.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      image: p.media[0]?.url || p.variants[0]?.sampleImage,
      createdAt: p.createdAt,
    }));
  }

  /**
   * Product Moderation: Update product status
   */
  async setProductStatus(productId: string, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { status, isAvailable: status === ProductStatus.LIVE },
    });

    return {
      message: `Product '${updated.name}' status set to '${status}'`,
      product: updated,
    };
  }

  /**
   * Order Monitoring: List all orders across marketplace
   */
  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        storeOrders: {
          include: {
            store: { select: { studioName: true, craft: true } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user ? { name: o.user.name, email: o.user.email } : { name: 'Guest' },
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      grandTotal: o.grandTotalPaise / 100,
      itemCount: o.storeOrders.reduce((sum, so) => sum + so.items.length, 0),
      createdAt: o.createdAt,
      subOrders: o.storeOrders.map((so) => ({
        id: so.id,
        subOrderNumber: so.subOrderNumber,
        storeName: so.store.studioName,
        status: so.status,
        total: so.totalPaise / 100,
        itemCount: so.items.length,
      })),
    }));
  }

  /**
   * Customer Management: List registered customers
   */
  async getCustomers() {
    const customers = await this.prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      include: {
        _count: { select: { orders: true, customizationRequests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      orderCount: c._count.orders,
      customizationCount: c._count.customizationRequests,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Customer Management: Set customer active/suspended
   */
  async setCustomerStatus(userId: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Customer account not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return {
      message: `Customer account status updated to '${status}'`,
      user: { id: updated.id, email: updated.email, status: updated.status },
    };
  }

  /**
   * Super Admin Only: List administrators
   */
  async getAdmins() {
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
      },
      include: {
        adminProfile: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      role: a.role,
      status: a.status,
      isSuperAdmin: a.role === Role.SUPER_ADMIN,
      adminProfile: a.adminProfile,
      createdAt: a.createdAt,
    }));
  }

  /**
   * Super Admin Only: Create new administrator
   */
  async createAdmin(dto: CreateAdminDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Administrator password must be at least 8 characters long');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const effectiveRoleType = (dto.roleType || dto.role || AdminRoleType.STORE_APPROVAL_ADMIN) as AdminRoleType;
    const isSuper = effectiveRoleType === AdminRoleType.SUPER_ADMIN;
    const role = isSuper ? Role.SUPER_ADMIN : Role.ADMIN;

    const defaultPermissionsMap: Record<AdminRoleType, string[]> = {
      [AdminRoleType.SUPER_ADMIN]: ['*'],
      [AdminRoleType.STORE_APPROVAL_ADMIN]: ['stores:read', 'stores:approve', 'stores:reject', 'stores:suspend'],
      [AdminRoleType.PRODUCT_ADMIN]: ['products:read', 'products:moderate'],
      [AdminRoleType.ORDER_ADMIN]: ['orders:read'],
      [AdminRoleType.CUSTOMER_SUPPORT_ADMIN]: ['customers:read', 'customers:manage'],
      [AdminRoleType.ANALYTICS_ADMIN]: ['analytics:read'],
    };

    const permissions = dto.permissions || defaultPermissionsMap[effectiveRoleType] || ['*'];

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: cleanEmail,
          phone: dto.phone ? dto.phone.trim() : null,
          passwordHash,
          role,
          status: UserStatus.ACTIVE,
        },
      });

      const profile = await tx.adminProfile.create({
        data: {
          userId: user.id,
          roleType: effectiveRoleType,
          permissions,
          isActive: true,
        },
      });

      return {
        message: `Administrator '${user.name}' created with role '${effectiveRoleType}'`,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminProfile: profile,
        admin: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminProfile: profile,
        },
      };
    });
  }

  /**
   * Super Admin Only: Update admin role & permissions
   */
  async updateAdminRole(adminUserId: string, dto: UpdateAdminRoleDto) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      include: { adminProfile: true },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    // Protection: Prevent modifying the initial seed Super Admin
    if (admin.email === (process.env.SUPER_ADMIN_EMAIL || 'superadmin@craftly.in') && dto.isActive === false) {
      throw new ForbiddenException('The root Super Administrator cannot be deactivated');
    }

    const isSuper = dto.roleType === AdminRoleType.SUPER_ADMIN;
    const role = isSuper ? Role.SUPER_ADMIN : Role.ADMIN;

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: adminUserId },
        data: { role },
      });

      const updatedProfile = await tx.adminProfile.upsert({
        where: { userId: adminUserId },
        update: {
          roleType: dto.roleType,
          permissions: dto.permissions !== undefined ? dto.permissions : undefined,
          isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        },
        create: {
          userId: adminUserId,
          roleType: dto.roleType,
          permissions: dto.permissions || ['*'],
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      return {
        message: 'Administrator permissions updated successfully',
        adminProfile: updatedProfile,
      };
    });
  }

  /**
   * Super Admin Only: Deactivate / Activate administrator
   */
  async setAdminStatus(adminUserId: string, isActive: boolean) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin) throw new NotFoundException('Admin user not found');

    if (admin.email === (process.env.SUPER_ADMIN_EMAIL || 'superadmin@craftly.in') && !isActive) {
      throw new ForbiddenException('The root Super Administrator cannot be deactivated');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: adminUserId },
        data: { status: isActive ? UserStatus.ACTIVE : UserStatus.SUSPENDED },
      }),
      this.prisma.adminProfile.update({
        where: { userId: adminUserId },
        data: { isActive },
      }),
    ]);

    return {
      message: `Administrator ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }
}
