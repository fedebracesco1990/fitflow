import { registerAs } from '@nestjs/config';

export default registerAs('qr', () => ({
  secret: process.env.QR_JWT_SECRET || process.env.JWT_SECRET,
  expiresIn: process.env.QR_JWT_EXPIRES_IN || '365d',
}));
