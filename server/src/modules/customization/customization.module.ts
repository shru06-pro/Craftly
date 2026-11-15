import { Module } from '@nestjs/common';
import { CustomizationController } from './customization.controller.js';
import { CustomizationService } from './customization.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CustomizationController],
  providers: [CustomizationService],
  exports: [CustomizationService],
})
export class CustomizationModule {}

