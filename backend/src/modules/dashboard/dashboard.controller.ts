import { Controller, Get, HttpCode, HttpStatus, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { 
  FinancialDashboardDto, 
  ReportsDataDto, 
  DashboardStatsDto,
  FinancialReportDto,
  BehaviorReportDto,
} from './dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }

  @Get('financial')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getFinancialDashboard(): Promise<FinancialDashboardDto> {
    return this.dashboardService.getFinancialDashboard();
  }

  @Get('reports')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ReportsDataDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getReportsData(start, end);
  }

  @Get('reports/export')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async exportReports(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const excelBuffer = await this.dashboardService.exportReports(start, end);

    const today = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reportes-fitflow-${today}.xlsx"`,
    });
    res.send(excelBuffer);
  }

  @Get('reports/financial')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getFinancialReport(
    @Query('month') month?: string,
    @Query('year') year?: string
  ): Promise<FinancialReportDto> {
    const monthNum = month ? parseInt(month, 10) : undefined;
    const yearNum = year ? parseInt(year, 10) : undefined;
    return this.dashboardService.getFinancialReport(monthNum, yearNum);
  }

  @Get('reports/behavior')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getBehaviorReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<BehaviorReportDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getBehaviorReport(start, end);
  }

  @Get('reports/export-csv')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async exportReportCsv(
    @Res() res: Response,
    @Query('type') type: 'financial' | 'behavior',
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const filters = {
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const csvContent = await this.dashboardService.exportReportToCsv(type, filters);
    const today = new Date().toISOString().split('T')[0];
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="reporte-${type}-${today}.csv"`,
    });
    res.send(csvContent);
  }
}
