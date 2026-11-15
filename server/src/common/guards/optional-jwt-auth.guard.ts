import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7).trim();
    const secret = process.env.JWT_SECRET || 'craftly_dev_jwt_secret_key_change_in_production_min_32_chars';

    try {
      const decoded: any = jwt.verify(token, secret);
      if (decoded && decoded.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            adminProfile: true,
            stores: { select: { id: true, status: true } },
          },
        });

        if (user && user.status === 'ACTIVE') {
          request.user = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
            adminProfile: user.adminProfile,
            ownedStoreIds: user.stores.map((s) => s.id),
            approvedStoreIds: user.stores.filter((s) => s.status === 'APPROVED').map((s) => s.id),
          };
        }
      }
    } catch {
      // Ignored for optional auth
      request.user = null;
    }

    return true;
  }
}

