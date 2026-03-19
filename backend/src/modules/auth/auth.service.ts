import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { TokensResponse } from './interfaces/tokens-response.interface';
import { AuthAuditLogService } from './auth-audit-log.service';

interface AuthRequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuthAuditLogService
  ) {}

  async register(registerDto: RegisterDto): Promise<TokensResponse> {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    this.logger.log(`[REGISTER] New user registered: ${user.email}`);
    return tokens;
  }

  async login(loginDto: LoginDto, context?: AuthRequestContext): Promise<TokensResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password, context);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.auditLogService.log({
      event: 'LOGIN_SUCCESS',
      email: user.email,
      userId: user.id,
      ...context,
    });
    this.logger.log(`[LOGIN] Successful login: ${user.email}`);
    return tokens;
  }

  async validateUser(email: string, password: string, context?: AuthRequestContext): Promise<User> {
    let user: User;

    try {
      user = await this.usersService.findByEmail(email);
    } catch {
      this.logger.warn(`[LOGIN_FAILED] User not found: ${email}`);
      await this.auditLogService.log({ event: 'LOGIN_FAILED', email, userId: null, ...context });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      this.logger.warn(`[ACCOUNT_LOCKED] Blocked login attempt for locked account: ${email}`);
      await this.auditLogService.log({
        event: 'ACCOUNT_LOCKED',
        email,
        userId: user.id,
        ...context,
      });
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en 15 minutos.'
      );
    }

    if (!user.isActive) {
      this.logger.warn(`[LOGIN_FAILED] Inactive user attempted login: ${email}`);
      await this.auditLogService.log({ event: 'LOGIN_FAILED', email, userId: user.id, ...context });
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await User.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`[LOGIN_FAILED] Invalid password for: ${email}`);
      await this.usersService.incrementFailedLoginAttempts(user.id);
      await this.auditLogService.log({ event: 'LOGIN_FAILED', email, userId: user.id, ...context });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usersService.resetFailedLoginAttempts(user.id);
    return user;
  }

  async getTokens(user: User): Promise<TokensResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          secret: this.configService.getOrThrow<string>('jwt.secret'),
          expiresIn: `${this.configService.getOrThrow<number>('jwt.accessTokenExpiration')}s`,
        }
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
          expiresIn: `${this.configService.getOrThrow<number>('jwt.refreshTokenExpiration')}s`,
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensResponse> {
    const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, userId);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string, context?: AuthRequestContext): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
    await this.auditLogService.log({ event: 'LOGOUT', userId, ...context });
    this.logger.log(`[LOGOUT] User logged out: ${userId}`);
  }

  // ==================== RECUPERACIÓN DE CONTRASEÑA ====================

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // Siempre retornar el mismo mensaje para evitar enumeration attacks
    const genericResponse = {
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
    };

    try {
      const user = await this.usersService.findByEmailSafe(forgotPasswordDto.email);

      if (!user) {
        return genericResponse;
      }

      const token = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      const salt = await bcrypt.genSalt();
      const hashedToken = await bcrypt.hash(token, salt);

      await this.usersService.setResetPasswordToken(user.id, hashedToken, expires);
      await this.auditLogService.log({
        event: 'PASSWORD_RESET_REQUEST',
        email: user.email,
        userId: user.id,
      });
      this.logger.log(`[PASSWORD_RESET_REQUEST] Reset token generated for: ${user.email}`);

      const frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
      const resetLink = `${frontendUrl}/auth/reset-password?token=${token}&userId=${user.id}`;

      // TODO: Enviar email real con el resetLink
      // await this.emailService.sendPasswordResetEmail(user.email, resetLink);

      // Solo mostrar link en desarrollo para testing
      if (this.configService.get<string>('app.nodeEnv') === 'development') {
        return {
          ...genericResponse,
          _devOnly: { resetLink },
        };
      }

      return genericResponse;
    } catch {
      // Si hay cualquier error, retornar respuesta genérica
      return genericResponse;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, userId, newPassword } = resetPasswordDto;

    const user = await this.usersService.findOneWithResetToken(userId);

    if (!user.resetPasswordTokenHash || !user.resetPasswordExpires) {
      throw new BadRequestException('Solicitud de cambio de contraseña inválida');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('El enlace ha expirado');
    }

    const isMatch = await bcrypt.compare(token, user.resetPasswordTokenHash);
    if (!isMatch) {
      throw new BadRequestException('Token inválido');
    }

    await this.usersService.updatePasswordFromReset(user.id, newPassword);
    await this.auditLogService.log({ event: 'PASSWORD_RESET_SUCCESS', userId });
    this.logger.log(`[PASSWORD_RESET] Password successfully reset for user: ${userId}`);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
