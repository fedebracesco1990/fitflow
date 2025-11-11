"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const allowedOrigins = configService.getOrThrow('app.allowedOrigins');
    const port = configService.getOrThrow('app.port');
    const apiPrefix = configService.getOrThrow('app.apiPrefix');
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}/${apiPrefix}`);
    console.log(`Environment: ${configService.get('app.nodeEnv')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map