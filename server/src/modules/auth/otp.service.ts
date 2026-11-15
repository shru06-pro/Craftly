import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface SmsProviderResult {
  success: boolean;
  message: string;
  provider: string;
  isMock: boolean;
  devCode?: string;
}

export interface ISmsProvider {
  sendSms(phone: string, message: string, otp: string): Promise<SmsProviderResult>;
}

/**
 * Mock SMS Provider: Used for development or when third-party provider credentials are not configured.
 * Logs the OTP to server stdout safely and indicates mock mode.
 */
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger('MockSmsProvider');

  async sendSms(phone: string, message: string, otp: string): Promise<SmsProviderResult> {
    this.logger.log(`📱 [SMS/OTP MOCK DELIVERY] To: ${phone} | Code: [ ${otp} ] | Msg: "${message}"`);
    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      message: 'OTP generated. Real SMS provider credentials not configured (mock mode active).',
      provider: 'mock',
      isMock: true,
      devCode: isDev ? otp : undefined,
    };
  }
}

/**
 * Twilio SMS Provider Adapter
 */
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger('TwilioSmsProvider');

  async sendSms(phone: string, message: string, otp: string): Promise<SmsProviderResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !fromPhone) {
      this.logger.warn('Twilio credentials incomplete, falling back to mock');
      return new MockSmsProvider().sendSms(phone, message, otp);
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const body = new URLSearchParams({
        To: phone,
        From: fromPhone,
        Body: message,
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.error(`Twilio send failed: ${errorText}`);
        throw new BadRequestException('Failed to deliver SMS via Twilio');
      }

      return {
        success: true,
        message: 'OTP delivered successfully via Twilio SMS',
        provider: 'twilio',
        isMock: false,
      };
    } catch (err: any) {
      this.logger.error(`Error sending Twilio SMS: ${err.message}`);
      throw new BadRequestException(`SMS delivery error: ${err.message}`);
    }
  }
}

/**
 * MSG91 SMS Provider Adapter
 */
export class Msg91SmsProvider implements ISmsProvider {
  private readonly logger = new Logger('Msg91SmsProvider');

  async sendSms(phone: string, message: string, otp: string): Promise<SmsProviderResult> {
    const authKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || 'CRAFTL';

    if (!authKey) {
      this.logger.warn('MSG91 authKey missing, falling back to mock');
      return new MockSmsProvider().sendSms(phone, message, otp);
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const url = `https://control.msg91.com/api/v5/otp?template_id=default&mobile=${cleanPhone}&authkey=${authKey}&otp=${otp}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) {
        throw new BadRequestException('Failed to deliver OTP via MSG91');
      }
      return {
        success: true,
        message: 'OTP delivered via MSG91',
        provider: 'msg91',
        isMock: false,
      };
    } catch (err: any) {
      this.logger.error(`MSG91 Error: ${err.message}`);
      throw new BadRequestException(`SMS provider error: ${err.message}`);
    }
  }
}

@Injectable()
export class OtpService {
  private provider: ISmsProvider;
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly prisma: PrismaService) {
    const providerType = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
    switch (providerType) {
      case 'twilio':
        this.provider = new TwilioSmsProvider();
        break;
      case 'msg91':
        this.provider = new Msg91SmsProvider();
        break;
      default:
        this.provider = new MockSmsProvider();
    }
    this.logger.log(`Initialized SMS/OTP Service with provider: ${providerType}`);
  }

  /**
   * Request an OTP for a mobile number.
   * Rate limited: 60 seconds minimum between resends.
   * Expiration: 5 minutes.
   */
  async sendOtp(rawPhone: string) {
    const phone = this.normalizePhone(rawPhone);

    // Rate-limiting check: last sent within 60s
    const recent = await this.prisma.otpVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    if (recent && now.getTime() - recent.lastSentAt.getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (now.getTime() - recent.lastSentAt.getTime())) / 1000);
      throw new BadRequestException(`Please wait ${waitSeconds} seconds before requesting a new OTP`);
    }

    // Cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpVerification.create({
      data: {
        phone,
        otpCode,
        expiresAt,
        verified: false,
        attempts: 0,
        lastSentAt: now,
      },
    });

    const message = `Your Craftly verification code is ${otpCode}. Valid for 5 minutes. Do not share this with anyone.`;
    const result = await this.provider.sendSms(phone, message, otpCode);

    return {
      phone,
      expiresInSeconds: 300,
      provider: result.provider,
      isMock: result.isMock,
      message: result.message,
      // In development mode when mock provider is used, expose devCode to allow smooth end-to-end testing
      devCode: result.devCode,
    };
  }

  /**
   * Verify an OTP code.
   * Maximum 5 attempts allowed per OTP session.
   */
  async verifyOtp(rawPhone: string, code: string): Promise<boolean> {
    const phone = this.normalizePhone(rawPhone);
    const cleanCode = (code || '').trim();

    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phone,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('No pending OTP request found for this phone number. Please request a new OTP.');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('The OTP code has expired. Please request a new one.');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Increment attempts
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });

    if (record.otpCode !== cleanCode) {
      const remainingAttempts = 5 - (record.attempts + 1);
      throw new BadRequestException(`Invalid OTP code. ${remainingAttempts} attempts remaining.`);
    }

    // Mark as verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return true;
  }

  private normalizePhone(phone: string): string {
    const cleaned = (phone || '').replace(/[\s\-\(\)]/g, '');
    if (!cleaned) {
      throw new BadRequestException('Phone number is required');
    }
    // Auto prefix +91 if 10-digit Indian mobile
    if (/^\d{10}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    return `+${cleaned}`;
  }
}

