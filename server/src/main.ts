import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API Prefix
  app.setGlobalPrefix('v1');

  // CORS for Vite storefront
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
      'Enterprise backend API for Craftly — India’s curated artisan marketplace and bespoke tailoring studio.',
    )
    .setVersion('1.0.0')
    .addTag('Catalogue', 'Handcrafted products, artisan studios, and category collections')
    .addTag('Pricing & Checkout', 'Server-authoritative pricing engine, quote generation, and coupon rules')
    .addTag('Orders & Checkout', 'Idempotent order sessions, artisan fulfilment splits, and milestone tracking')
    .addTag('Craft Advisor', 'Heirloom knowledge base and catalogue-backed recommendation query')
    .addTag('Newsletter', 'The Craftly Dispatch subscription management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Craftly API Documentation',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`✨ Craftly Enterprise Backend running at: http://localhost:${port}/v1`);
  console.log(`📖 Interactive OpenAPI (Swagger) Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
