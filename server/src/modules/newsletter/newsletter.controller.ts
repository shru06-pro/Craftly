import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsletterService, SubscribeNewsletterDto } from './newsletter.service.js';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to The Craftly Dispatch for atelier releases and craft essays' })
  async subscribe(@Body() body: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(body);
  }
}
