import { Controller, Post, UseGuards } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('trigger/expiring-memberships')
  @Roles(Role.ADMIN)
  async triggerExpiringMemberships() {
    await this.schedulerService.handleExpiringMemberships();
    return { message: 'Expiring memberships check triggered successfully' };
  }

  @Post('trigger/expired-memberships')
  @Roles(Role.ADMIN)
  async triggerExpiredMemberships() {
    await this.schedulerService.handleExpiredMemberships();
    return { message: 'Expired memberships check triggered successfully' };
  }

  @Post('trigger/low-attendance-weekly')
  @Roles(Role.ADMIN)
  async triggerLowAttendanceWeekly() {
    await this.schedulerService.handleWeeklyLowAttendanceCheck();
    return { message: 'Weekly low attendance check triggered successfully' };
  }

  @Post('trigger/low-attendance-monthly')
  @Roles(Role.ADMIN)
  async triggerLowAttendanceMonthly() {
    await this.schedulerService.handleMonthlyLowAttendanceCheck();
    return { message: 'Monthly low attendance check triggered successfully' };
  }
}
