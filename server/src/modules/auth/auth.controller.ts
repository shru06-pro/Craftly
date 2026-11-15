import { Controller, Post, Get, Put, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthService,
  RegisterCustomerDto,
  LoginDto,
  RegisterStoreOwnerDto,
  OtpLoginDto,
} from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, description: 'Customer account created' })
  async registerCustomer(@Body() body: RegisterCustomerDto) {
    return this.authService.registerCustomer(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access token and user profile' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register-store-owner')
  @ApiOperation({ summary: 'Register a store owner and submit initial store application' })
  @ApiResponse({ status: 201, description: 'Owner registered with pending store application' })
  async registerStoreOwner(@Body() body: RegisterStoreOwnerDto) {
    return this.authService.registerStoreOwner(body);
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP code to mobile phone number' })
  async sendPhoneOtp(@Body('phone') phone: string) {
    return this.authService.sendPhoneOtp(phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone OTP and sign in / register' })
  async verifyPhoneOtp(@Body() body: OtpLoginDto) {
    return this.authService.verifyPhoneOtp(body);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete password reset with token' })
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile, roles, and stores' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer shopping preferences' })
  async getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getPreferences(user.id);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save or update customer shopping preferences' })
  async updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.authService.updatePreferences(user.id, body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out and invalidate session' })
  async logout() {
    return { message: 'Successfully signed out' };
  }
}

