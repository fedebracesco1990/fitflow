import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config-test')
  testConfig() {
    return {
      jwtSecret: this.configService.get('jwt.secret') ? 'Cargado' : 'No encontrado',
      jwtExpiration: this.configService.get('jwt.accessTokenExpiration'),
      dbHost: this.configService.get('database.host'),
      nodeEnv: this.configService.get('app.nodeEnv'),
    };
  }
}
