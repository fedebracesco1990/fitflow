import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AccessService, ValidateQrResult } from './access.service';
import { ValidateQrDto, AccessLogsQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AccessLog } from './entities/access-log.entity';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Controller('access')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('validate-qr')
  @Roles(Role.ADMIN, Role.TRAINER)
  async validateQr(
    @Body() validateQrDto: ValidateQrDto,
    @Request() req: { user: AuthenticatedUser }
  ): Promise<ValidateQrResult> {
    return this.accessService.validateQrAccess(validateQrDto.token, req.user.userId);
  }

  @Get('logs')
  @Roles(Role.ADMIN, Role.TRAINER)
  async getAccessLogs(@Query() query: AccessLogsQueryDto): Promise<PaginatedResponse<AccessLog>> {
    return this.accessService.getAccessLogs(query);
  }
}
