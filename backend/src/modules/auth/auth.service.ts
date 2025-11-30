import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<TokensResponse> {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login(loginDto: LoginDto): Promise<TokensResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await User.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
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
  }

  // ==================== RECUPERACIÓN DE CONTRASEÑA ====================

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    const token = uuidv4();

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const salt = await bcrypt.genSalt();
    const hashedToken = await bcrypt.hash(token, salt);

    await this.usersService.setResetPasswordToken(user.id, hashedToken, expires);

    const resetLink = `https://tu-frontend.com/reset-password?token=${token}&userId=${user.id}`;

    return {
      message: 'Si el correo existe, se ha enviado un enlace (Simulado)',
      link: resetLink, // Retornamos esto solo para que puedas probar en Postman
    };
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

    return { message: 'Contraseña actualizada correctamente' };
  }
}
