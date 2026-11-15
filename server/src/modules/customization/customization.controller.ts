import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import fs from 'fs';
import {
  CustomizationService,
  CreateCustomizationRequestInput,
  UpdateCustomizationStatusInput,
} from './customization.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { StoreOwnershipGuard } from '../../common/guards/store-ownership.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

// Ensure upload directory exists
const uploadDir = join(process.cwd(), 'uploads', 'customizations');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Customization')
@Controller('customization')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomizationController {
  constructor(private readonly customizationService: CustomizationService) {}

  @Post('request')
  @ApiOperation({ summary: 'Customer: Submit a bespoke customization request with details' })
  async createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCustomizationRequestInput,
  ) {
    return this.customizationService.createRequest(user.id, body);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Customer: Submit a bespoke customization request (alias)' })
  async createRequestAlias(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCustomizationRequestInput,
  ) {
    return this.customizationService.createRequest(user.id, body);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Customer: List all customization inquiries and their statuses' })
  async getMyRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.customizationService.getCustomerRequests(user.id);
  }

  @Post('upload-reference')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Customer: Upload a reference image for customization' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `ref-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Only JPG, JPEG, PNG, and WEBP image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadReferenceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    return {
      url: `/uploads/customizations/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }

  @Get('store/:storeId/requests')
  @UseGuards(RolesGuard, StoreOwnershipGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Store Owner: Get all customization requests for owned store' })
  async getStoreRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
  ) {
    return this.customizationService.getStoreRequests(user.id, storeId);
  }

  @Put('store/:storeId/requests/:requestId')
  @Patch('store/:storeId/requests/:requestId')
  @UseGuards(RolesGuard, StoreOwnershipGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Store Owner: Accept, reject, or request clarification on a request' })
  async updateRequestStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @Body() body: UpdateCustomizationStatusInput,
  ) {
    return this.customizationService.updateRequestStatus(user.id, storeId, requestId, body);
  }

  @Put('requests/:requestId/respond')
  @Patch('requests/:requestId/respond')
  @UseGuards(RolesGuard)
  @Roles(Role.STORE_OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Store Owner: Direct response to customization request' })
  async respondToRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('requestId') requestId: string,
    @Body() body: UpdateCustomizationStatusInput,
  ) {
    return this.customizationService.respondToRequest(user.id, requestId, body);
  }
}
