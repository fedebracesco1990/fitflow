import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:4200'),
    credentials: true,
  });

  // Prefijo global para API
  app.setGlobalPrefix('api');

  const port = configService.get('BACKEND_PORT', 3000);
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
}
bootstrap();
