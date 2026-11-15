import { Module } from '@nestjs/common';
import { StoreProductsController } from './store-products.controller.js';
import { StoreProductsService } from './store-products.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreProductsController],
  providers: [StoreProductsService],
  exports: [StoreProductsService],
})
export class StoreProductsModule {}

