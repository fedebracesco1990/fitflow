import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import type { TokensResponse } from './interfaces/tokens-response.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractContext(req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()) ??
      req.ip ??
      null;
    const userAgent = (req.headers['user-agent'] as string) ?? null;
    return { ipAddress, userAgent };
  }

  @Roles(Role.ADMIN)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<TokensResponse> {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<TokensResponse> {
    const context = this.extractContext(req);
    return await this.authService.login(loginDto, context);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser('userId') userId: string,
    @CurrentUser('refreshToken') refreshToken: string
  ): Promise<TokensResponse> {
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('session')
  @HttpCode(HttpStatus.OK)
  checkSession(@CurrentUser() user: AuthenticatedUser) {
    return {
      status: 'authenticated',
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('userId') userId: string, @Req() req: Request): Promise<void> {
    const context = this.extractContext(req);
    return await this.authService.logout(userId, context);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
