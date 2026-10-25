import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export class SubscribeNewsletterDto {
  email!: string;
  source?: string;
}

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    if (!dto.email || !dto.email.includes('@')) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === 'UNSUBSCRIBED') {
        await this.prisma.newsletterSubscriber.update({
          where: { email },
          data: { status: 'ACTIVE', subscribedAt: new Date() },
        });
      }
      return {
        message: 'Welcome back! You are subscribed to The Craftly Dispatch.',
        email,
      };
    }

    await this.prisma.newsletterSubscriber.create({
      data: {
        email,
        source: dto.source || 'storefront_footer',
        status: 'ACTIVE',
      },
    });

    return {
      message: 'Thank you for subscribing to The Craftly Dispatch! Your first dispatch will arrive shortly.',
      email,
    };
  }
}
