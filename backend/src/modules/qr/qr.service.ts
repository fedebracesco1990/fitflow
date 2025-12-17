import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as QRCode from 'qrcode';

export interface QrTokenPayload {
  userId: string;
  timestamp: number;
  type: 'access';
}

const QR_OPTIONS = {
  errorCorrectionLevel: 'M' as const,
  width: 300,
  margin: 2,
};

@Injectable()
export class QrService {
  constructor(private readonly jwtService: JwtService) {}

  generateQrToken(userId: string): string {
    const payload: QrTokenPayload = {
      userId,
      timestamp: Date.now(),
      type: 'access',
    };

    return this.jwtService.sign(payload);
  }

  async generateQrDataUrl(userId: string): Promise<string> {
    const token = this.generateQrToken(userId);
    return await QRCode.toDataURL(token, {
      ...QR_OPTIONS,
      type: 'image/png',
    });
  }

  async generateQrBuffer(userId: string): Promise<Buffer> {
    const token = this.generateQrToken(userId);
    return await QRCode.toBuffer(token, {
      ...QR_OPTIONS,
      type: 'png',
    });
  }

  validateQrToken(token: string): QrTokenPayload | null {
    try {
      return this.jwtService.verify<QrTokenPayload>(token);
    } catch {
      return null;
    }
  }
}
