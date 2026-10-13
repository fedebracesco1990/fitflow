import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers
  app.use(helmet());
  const configService = app.get(ConfigService);

  // Behind a reverse proxy (nginx in docker-compose.prod.yml), take the client IP from
  // X-Forwarded-For; otherwise rate limiting would treat every user as the proxy's IP
  if (String(configService.get<boolean | string>('TRUST_PROXY')) === 'true') {
    app.set('trust proxy', 1);
  }

  const allowedOrigins = configService.getOrThrow<string[]>('app.allowedOrigins');
  const port = configService.getOrThrow<number>('app.port');
  const apiPrefix = configService.getOrThrow<string>('app.apiPrefix');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Backend running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${configService.get<string>('app.nodeEnv')}`);
}
void bootstrap();
