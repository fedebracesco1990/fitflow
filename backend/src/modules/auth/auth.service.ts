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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<TokensResponse> {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    this.logger.log(`[REGISTER] New user registered: ${user.email}`);
    return tokens;
  }

  async login(loginDto: LoginDto): Promise<TokensResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    this.logger.log(`[LOGIN] Successful login: ${user.email}`);
    return tokens;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      this.logger.warn(`[LOGIN_FAILED] User not found: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await User.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`[LOGIN_FAILED] Invalid password for: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      this.logger.warn(`[LOGIN_FAILED] Inactive user attempted login: ${email}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

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

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
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
      this.logger.log(`[PASSWORD_RESET_REQUEST] Reset token generated for: ${user.email}`);

      const frontendUrl =
        this.configService.get<string>('app.frontendUrl') || 'http://localhost:4200';
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
    this.logger.log(`[PASSWORD_RESET] Password successfully reset for user: ${userId}`);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
