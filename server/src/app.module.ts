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
import { AuthModule } from './modules/auth/auth.module.js';
import { StoresModule } from './modules/stores/stores.module.js';
import { StoreProductsModule } from './modules/store-products/store-products.module.js';
import { CustomizationModule } from './modules/customization/customization.module.js';
import { AdminModule } from './modules/admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CatalogueModule,
    StoresModule,
    StoreProductsModule,
    PricingModule,
    OrdersModule,
    CustomizationModule,
    AdminModule,
    AssistantModule,
    NewsletterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
