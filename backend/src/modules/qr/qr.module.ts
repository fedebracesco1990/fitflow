import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QrService } from './qr.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('qr.expiresIn', '365d');
        return {
          secret: configService.getOrThrow<string>('qr.secret'),
          signOptions: {
            expiresIn: expiresIn as `${number}d`,
          },
        };
      },
    }),
  ],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
