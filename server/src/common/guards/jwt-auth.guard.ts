import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token is missing or malformed');
    }

    const token = authHeader.substring(7).trim();
    const secret = process.env.JWT_SECRET || 'craftly_dev_jwt_secret_key_change_in_production_min_32_chars';

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Authentication token has expired. Please sign in again.');
      }
      throw new UnauthorizedException('Invalid authentication token');
    }

    if (!decoded || !decoded.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        adminProfile: true,
        stores: {
          select: { id: true, status: true, studioName: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account has been suspended or deactivated');
    }

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

    return true;
  }
}

