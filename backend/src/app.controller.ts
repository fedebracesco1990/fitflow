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
      jwtSecret: this.configService.get<string>('jwt.secret') ? 'Cargado' : 'No encontrado',
      jwtExpiration: this.configService.get<number>('jwt.accessTokenExpiration'),
      dbHost: this.configService.get<string>('database.host'),
      nodeEnv: this.configService.get<string>('app.nodeEnv'),
    };
  }
}
