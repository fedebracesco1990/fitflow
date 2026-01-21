import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenExpiration: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION || '2700', 10),
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshTokenExpiration: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION || '604800', 10),
  algorithm: 'HS256' as const,
}));
