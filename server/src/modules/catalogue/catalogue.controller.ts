import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CatalogueService, ProductQueryDto } from './catalogue.service.js';

@ApiTags('Catalogue')
@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Get('products')
  @ApiOperation({ summary: 'List and filter handcrafted products with pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term across craft, artisan, and product name' })
  @ApiQuery({ name: 'category', required: false, description: 'Category slug (e.g., apparel, leather, jewelry)' })
  @ApiQuery({ name: 'customizable', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['price_asc', 'price_desc', 'rating', 'newest'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.catalogueService.getProducts(query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get full product details by slug or ID' })
  @ApiResponse({ status: 200, description: 'Product with artisan, color variants, media, and reviews' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.catalogueService.getProductBySlug(slug);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all curated craft categories with product counts' })
  async getCategories() {
    return this.catalogueService.getCategories();
  }

  @Get('artisans')
  @ApiOperation({ summary: 'List all featured master artisan guilds' })
  async getArtisans() {
    return this.catalogueService.getArtisans();
  }

  @Get('artisans/:id')
  @ApiOperation({ summary: 'Get artisan profile and their crafted collection' })
  async getArtisanById(@Param('id') id: string) {
    return this.catalogueService.getArtisanById(id);
  }
}
