import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    // Super Admin has all permissions
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Regular admin must have active admin profile with permission or wildcard '*'
    const permissions: string[] = user.adminProfile?.permissions || [];
    const isActive = user.adminProfile?.isActive;

    if (!isActive) {
      throw new ForbiddenException('Administrative account has been suspended');
    }

    if (permissions.includes('*')) {
      return true;
    }

    const hasAll = requiredPermissions.every((p) => permissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException(
        `Access denied: Missing administrative permissions (${requiredPermissions.join(', ')})`,
      );
    }

    return true;
  }
}

