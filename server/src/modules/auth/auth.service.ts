import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import { Role, StoreStatus, UserStatus } from '@prisma/client';

import { IsString, IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappConsent?: boolean;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RegisterStoreOwnerDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  storeName!: string;

  @IsString()
  craft!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  leadTime?: string;

  @IsOptional()
  @IsEmail()
  storeEmail?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  pincode?: string;
}

export class OtpLoginDto {
  @IsString()
  phone!: string;

  @IsString()
  otp!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'craftly_dev_jwt_secret_key_change_in_production_min_32_chars';
  }

  private generateTokens(user: { id: string; email: string; role: string; name: string }) {
    const secret = this.getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn } as any,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /**
   * Register a new Customer with email and password
   */
  async registerCustomer(dto: RegisterCustomerDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanPhone = dto.phone ? dto.phone.trim() : null;

    // Check duplicate email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists. Please sign in instead.');
    }

    if (cleanPhone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        throw new ConflictException('An account with this phone number already exists.');
      }
    }

    if (dto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        marketingConsent: Boolean(dto.marketingConsent),
        whatsappConsent: Boolean(dto.whatsappConsent),
        consentTimestamp: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user);

    return {
      message: 'Account created successfully',
      user,
      ...tokens,
    };
  }

  /**
   * Standard Login (Customer, Store Owner, Admin, Super Admin)
   */
  async login(dto: LoginDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        adminProfile: true,
        stores: {
          select: { id: true, studioName: true, status: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account has been deactivated or suspended. Please contact support.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    const tokens = this.generateTokens(user);

    return {
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        adminProfile: user.adminProfile,
        stores: user.stores,
      },
      ...tokens,
    };
  }

  /**
   * Dedicated Store Owner Registration
   * Registers user as STORE_OWNER, creates Artisan store with status PENDING,
   * and creates an official StoreApplication for administrative review.
   */
  async registerStoreOwner(dto: RegisterStoreOwnerDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanPhone = dto.phone.trim();

    const existingEmail = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const existingPhone = await this.prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existingPhone) {
      throw new ConflictException('An account with this phone number already exists.');
    }

    if (dto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Database transaction to create Owner, Store, and StoreApplication atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          role: Role.STORE_OWNER,
          status: UserStatus.ACTIVE,
        },
      });

      const storeId = `store-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const loc = (dto.location || dto.city || dto.state || 'India').trim();
      const bioText = (dto.description || dto.bio || 'Indian craft atelier specializing in handloom heritage.').trim();

      const store = await tx.artisan.create({
        data: {
          id: storeId,
          name: dto.name.trim(),
          studioName: dto.storeName.trim(),
          craft: dto.craft.trim(),
          location: loc,
          state: dto.state.trim(),
          bio: bioText,
          leadTimeMinDays: 7,
          leadTimeMaxDays: 14,
          storeEmail: dto.storeEmail ? dto.storeEmail.trim() : cleanEmail,
          storePhone: dto.storePhone ? dto.storePhone.trim() : cleanPhone,
          addressLine: dto.addressLine || null,
          pincode: dto.pincode || null,
          status: StoreStatus.PENDING,
          ownerId: owner.id,
          verified: false,
          appliedAt: new Date(),
        },
      });

      const application = await tx.storeApplication.create({
        data: {
          storeId: store.id,
          ownerId: owner.id,
          status: StoreStatus.PENDING,
          notes: `New store owner application submitted by ${owner.name} (${owner.email}) for store '${store.studioName}'.`,
        },
      });

      return { owner, store, application };
    });

    const tokens = this.generateTokens(result.owner);

    return {
      message: 'Store registration application submitted successfully. It is currently under review by our curation team.',
      user: {
        id: result.owner.id,
        email: result.owner.email,
        name: result.owner.name,
        phone: result.owner.phone,
        role: result.owner.role,
        stores: [
          {
            id: result.store.id,
            studioName: result.store.studioName,
            status: result.store.status,
            craft: result.store.craft,
          },
        ],
      },
      store: result.store,
      application: result.application,
      storeApplication: {
        id: result.application.id,
        storeId: result.store.id,
        status: result.application.status,
        submittedAt: result.application.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Phone OTP: Send OTP code
   */
  async sendPhoneOtp(phone: string) {
    return this.otpService.sendOtp(phone);
  }

  /**
   * Phone OTP: Verify and Login / Register
   */
  async verifyPhoneOtp(dto: OtpLoginDto) {
    await this.otpService.verifyOtp(dto.phone, dto.otp);

    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: {
        adminProfile: true,
        stores: { select: { id: true, studioName: true, status: true } },
      },
    });

    // If new phone user, auto-register as Customer
    if (!user) {
      const generatedEmail = `patron_${Date.now()}@craftly.in`;
      const randomPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          email: generatedEmail,
          name: dto.name?.trim() || `Patron ${dto.phone.slice(-4)}`,
          passwordHash,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
        },
        include: {
          adminProfile: true,
          stores: { select: { id: true, studioName: true, status: true } },
        },
      });
    }

    const tokens = this.generateTokens(user);

    return {
      message: 'Phone authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        adminProfile: user.adminProfile,
        stores: user.stores,
      },
      ...tokens,
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      // Return ambiguous success for security
      return { message: 'If an account exists with that email, instructions have been sent.' };
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'pwd_reset' },
      this.getJwtSecret(),
      { expiresIn: '1h' },
    );

    return {
      message: 'Password reset link generated.',
      // Expose resetToken in dev mode for testing
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  /**
   * Complete password reset
   */
  async resetPassword(token: string, newPassword: string) {
    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    try {
      const decoded: any = jwt.verify(token, this.getJwtSecret());
      if (!decoded || decoded.type !== 'pwd_reset') {
        throw new BadRequestException('Invalid or expired password reset token.');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await this.prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash },
      });

      return { message: 'Password has been reset successfully. You can now sign in.' };
    } catch {
      throw new BadRequestException('Invalid or expired password reset token.');
    }
  }

  /**
   * Fetch current authenticated user's profile and owned stores
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: true,
        stores: {
          select: {
            id: true,
            studioName: true,
            name: true,
            craft: true,
            location: true,
            state: true,
            status: true,
            rejectionReason: true,
            avatarUrl: true,
            badge: true,
            appliedAt: true,
            approvedAt: true,
          },
        },
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      adminProfile: user.adminProfile,
      stores: user.stores,
      addresses: user.addresses,
      shoppingPreferences: (user as any).shoppingPreferences || null,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get customer shopping preferences
   */
  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { shoppingPreferences: true },
    });
    return user?.shoppingPreferences || {};
  }

  /**
   * Update customer shopping preferences
   */
  async updatePreferences(userId: string, preferences: any) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        shoppingPreferences: preferences,
      },
      select: {
        id: true,
        shoppingPreferences: true,
      },
    });
    return {
      message: 'Shopping preferences updated successfully',
      preferences: updated.shoppingPreferences,
    };
  }
}
