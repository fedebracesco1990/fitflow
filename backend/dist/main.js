"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: configService.get('FRONTEND_URL', 'http://localhost:4200'),
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = configService.get('BACKEND_PORT', 3000);
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map