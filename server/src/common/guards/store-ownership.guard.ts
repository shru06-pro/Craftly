import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Role, StoreStatus } from '@prisma/client';

@Injectable()
export class StoreOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Super Admin can inspect all stores
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Find storeId from route parameters, query, or body
    const storeId =
      request.params?.storeId ||
      request.params?.id ||
      request.query?.storeId ||
      request.body?.storeId;

    if (!storeId || typeof storeId !== 'string') {
      throw new ForbiddenException('Store ID parameter is missing in request context');
    }

    const store = await this.prisma.artisan.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store not found with ID '${storeId}'`);
    }

    // Strict ownership verification:
    if (store.ownerId !== user.id) {
      throw new ForbiddenException(
        'Access denied: You do not own this store and cannot access its private management data',
      );
    }

    // Store approval verification:
    // If the store is not approved yet (e.g. PENDING, REJECTED, SUSPENDED), deny operational management
    // (except for reading the store profile/status itself)
    const isInspectionRoute =
      request.method === 'GET' &&
      (request.route?.path?.includes('/stores/my/stores/:id') || request.route?.path?.includes('/status'));

    if (!isInspectionRoute && store.status !== StoreStatus.APPROVED) {
      throw new ForbiddenException(
        `Store operations are disabled. Store application status is '${store.status}'. ` +
          (store.rejectionReason ? `Reason: ${store.rejectionReason}` : 'Awaiting platform review.'),
      );
    }

    request.store = store;
    return true;
  }
}

