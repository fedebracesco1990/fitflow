import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, AttendanceStatsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AccessLog } from '../access/entities/access-log.entity';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER)
  async getAttendance(@Query() query: AttendanceQueryDto): Promise<PaginatedResponse<AccessLog>> {
    return this.attendanceService.getAttendance(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.TRAINER)
  async getStats(@Query() query: AttendanceQueryDto): Promise<AttendanceStatsDto> {
    return this.attendanceService.getStats(query);
  }

  @Get('user/:userId')
  async getUserAttendance(
    @Param('userId') userId: string,
    @Query() query: AttendanceQueryDto,
    @Request() req: { user: { id: string; role: Role } }
  ): Promise<PaginatedResponse<AccessLog>> {
    const isOwnProfile = req.user.id === userId;
    const isAdminOrTrainer = req.user.role === Role.ADMIN || req.user.role === Role.TRAINER;

    if (!isOwnProfile && !isAdminOrTrainer) {
      throw new ForbiddenException('No tienes permiso para ver el historial de otro usuario');
    }

    return this.attendanceService.getUserAttendance(userId, query);
  }

  @Get('user/:userId/count')
  async getUserMonthlyCount(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string; role: Role } },
    @Query('month') month?: string,
    @Query('year') year?: string
  ): Promise<{ count: number; month: number; year: number }> {
    const isOwnProfile = req.user.id === userId;
    const isAdminOrTrainer = req.user.role === Role.ADMIN || req.user.role === Role.TRAINER;

    if (!isOwnProfile && !isAdminOrTrainer) {
      throw new ForbiddenException('No tienes permiso para ver el conteo de otro usuario');
    }

    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const count = await this.attendanceService.getUserMonthlyCount(userId, targetMonth, targetYear);

    return {
      count,
      month: targetMonth,
      year: targetYear,
    };
  }
}
