import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static uploads
  const uploadPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadPath));

  // Global API Prefix
  app.setGlobalPrefix('v1');

  // Flexible CORS for Vercel storefront & local dev
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.includes(',')
        ? corsOrigin.split(',').map((o) => o.trim())
        : corsOrigin === '*'
          ? true
          : corsOrigin
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global Pipes & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI 3.1 Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Craftly Atelier & Marketplace API')
    .setDescription(
      'Enterprise backend API for Craftly — India’s curated artisan marketplace, multi-vendor stores, and bespoke tailoring studio.',
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .addTag('Authentication & Identity', 'Customer, store owner, and admin authentication, phone OTP')
    .addTag('Stores', 'Browse approved artisan stores and manage store profiles')
    .addTag('Store Owner Products & Inventory', 'Store-specific product creation, variants, and stock management')
    .addTag('Customization', 'Bespoke customization inquiries, reference image uploads, and status tracking')
    .addTag('Orders & Multi-Vendor Fulfilment', 'Multi-store checkout, split fulfilment sub-orders, and milestone tracking')
    .addTag('Platform Administration & Moderation', 'Store approvals, product moderation, order monitoring, and admin management')
    .addTag('Catalogue', 'Handcrafted products, artisan studios, and category collections')
    .addTag('Pricing & Checkout', 'Server-authoritative pricing engine, quote generation, and coupon rules')
    .addTag('Craft Advisor', 'Heirloom knowledge base and catalogue-backed recommendation query')
    .addTag('Newsletter', 'The Craftly Dispatch subscription management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Craftly API Documentation',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`✨ Craftly Enterprise Backend running at: http://localhost:${port}/v1`);
  console.log(`📖 Interactive OpenAPI (Swagger) Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
