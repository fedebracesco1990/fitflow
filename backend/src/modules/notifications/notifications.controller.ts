import { Controller, Post, Delete, Get, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto, SendNotificationDto, CreateTemplateDto, UpdateTemplateDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('debug/tokens')
  @Roles(Role.ADMIN)
  async debugTokens() {
    return this.notificationsService.debugTokens();
  }

  @Delete('debug/cleanup')
  @Roles(Role.ADMIN)
  async cleanupDuplicateTokens() {
    return this.notificationsService.cleanupDuplicateTokens();
  }

  @Post('register-token')
  async registerToken(@CurrentUser('userId') userId: string, @Body() dto: RegisterTokenDto) {
    return this.notificationsService.registerToken(userId, dto);
  }

  @Delete('unregister-token')
  async unregisterToken(@CurrentUser('userId') userId: string, @Query('token') token: string) {
    await this.notificationsService.unregisterToken(userId, token);
    return { message: 'Token unregistered successfully' };
  }

  @Post('send')
  @Roles(Role.ADMIN)
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Get('templates')
  @Roles(Role.ADMIN)
  async getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Post('templates')
  @Roles(Role.ADMIN)
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationsService.createTemplate(dto);
  }

  @Post('templates/:id')
  @Roles(Role.ADMIN)
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.notificationsService.updateTemplate(id, dto);
  }
}
