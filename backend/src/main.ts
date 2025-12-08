import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());
  const configService = app.get(ConfigService);

  const allowedOrigins = configService.getOrThrow<string[]>('app.allowedOrigins');
  const port = configService.getOrThrow<number>('app.port');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Environment: ${configService.get<string>('app.nodeEnv')}`);
}
void bootstrap();
