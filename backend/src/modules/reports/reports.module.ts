import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExcelReportGenerator } from './generators/excel-report.generator';
import { PdfReportGenerator } from './generators/pdf-report.generator';
import { Payment } from '../payments/entities/payment.entity';
import { AccessLog } from '../access/entities/access-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, AccessLog, User])],
  controllers: [ReportsController],
  providers: [ReportsService, ExcelReportGenerator, PdfReportGenerator],
  exports: [ReportsService],
})
export class ReportsModule {}
