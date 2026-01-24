import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ReportsService } from './reports.service';
import { CreateReportDto, ReportFormat, ReportType } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private sendReportResponse(
    res: Response,
    buffer: Buffer,
    format: ReportFormat,
    reportName: string
  ): void {
    const today = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type': this.reportsService.getContentType(format),
      'Content-Disposition': `attachment; filename="${reportName}-${today}.${this.reportsService.getFileExtension(format)}"`,
    });
    res.send(buffer);
  }

  @Post('financial')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async generateFinancialReport(@Body() dto: Omit<CreateReportDto, 'type'>, @Res() res: Response) {
    const reportDto: CreateReportDto = { ...dto, type: ReportType.FINANCIAL };
    const buffer = await this.reportsService.generateReport(reportDto);
    this.sendReportResponse(res, buffer, reportDto.format, 'reporte-financiero');
  }

  @Post('attendance')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async generateAttendanceReport(@Body() dto: Omit<CreateReportDto, 'type'>, @Res() res: Response) {
    const reportDto: CreateReportDto = { ...dto, type: ReportType.ATTENDANCE };
    const buffer = await this.reportsService.generateReport(reportDto);
    this.sendReportResponse(res, buffer, reportDto.format, 'reporte-asistencia');
  }

  @Post('users')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async generateUsersReport(@Body() dto: Omit<CreateReportDto, 'type'>, @Res() res: Response) {
    const reportDto: CreateReportDto = { ...dto, type: ReportType.USERS };
    const buffer = await this.reportsService.generateReport(reportDto);
    this.sendReportResponse(res, buffer, reportDto.format, 'reporte-usuarios');
  }
}
