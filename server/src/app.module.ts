import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CatalogueModule } from './modules/catalogue/catalogue.module.js';
import { PricingModule } from './modules/pricing/pricing.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { AssistantModule } from './modules/assistant/assistant.module.js';
import { NewsletterModule } from './modules/newsletter/newsletter.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CatalogueModule,
    PricingModule,
    OrdersModule,
    AssistantModule,
    NewsletterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
