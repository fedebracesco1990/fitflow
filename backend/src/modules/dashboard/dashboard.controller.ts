import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { FinancialDashboardDto } from './dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('financial')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getFinancialDashboard(): Promise<FinancialDashboardDto> {
    return this.dashboardService.getFinancialDashboard();
  }
}
