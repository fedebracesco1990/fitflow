import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { AccessLog } from '../access/entities/access-log.entity';
import { User } from '../users/entities/user.entity';
import { CreateReportDto, ReportFormat, ReportType } from './dto/create-report.dto';
import { formatDate, formatTime } from './utils/date.utils';
import {
  PAYMENT_METHOD_TRANSLATIONS,
  MEMBERSHIP_STATUS_TRANSLATIONS,
  DAY_OF_WEEK_NAMES,
  MONTH_NAMES,
} from './constants/report.constants';
import { ExcelReportGenerator } from './generators/excel-report.generator';
import { PdfReportGenerator } from './generators/pdf-report.generator';
import {
  FinancialReportData,
  AttendanceReportData,
  UsersReportData,
} from './interfaces/report-generator.interface';

interface RawUserMembershipResult {
  user_id: string;
  user_name: string;
  user_email: string;
  user_isActive: boolean;
  membership_id: string | null;
  membership_status: string | null;
  membership_endDate: Date | null;
  membershipType_name: string | null;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly excelGenerator: ExcelReportGenerator,
    private readonly pdfGenerator: PdfReportGenerator
  ) {}

  async generateReport(dto: CreateReportDto): Promise<Buffer> {
    const { type, format, startDate, endDate } = dto;

    switch (type) {
      case ReportType.FINANCIAL:
        return this.generateFinancialReport(format, startDate, endDate);
      case ReportType.ATTENDANCE:
        return this.generateAttendanceReport(format, startDate, endDate);
      case ReportType.USERS:
        return this.generateUsersReport(format);
      default:
        throw new Error(`Unsupported report type: ${type as string}`);
    }
  }

  private async generateFinancialReport(
    format: ReportFormat,
    startDate?: string,
    endDate?: string
  ): Promise<Buffer> {
    const data = await this.getFinancialData(startDate, endDate);

    if (format === ReportFormat.PDF) {
      return this.pdfGenerator.generateFinancialReport(data);
    }
    return this.excelGenerator.generateFinancialReport(data);
  }

  private async generateAttendanceReport(
    format: ReportFormat,
    startDate?: string,
    endDate?: string
  ): Promise<Buffer> {
    const data = await this.getAttendanceData(startDate, endDate);

    if (format === ReportFormat.PDF) {
      return this.pdfGenerator.generateAttendanceReport(data);
    }
    return this.excelGenerator.generateAttendanceReport(data);
  }

  private async generateUsersReport(format: ReportFormat): Promise<Buffer> {
    const data = await this.getUsersData();

    if (format === ReportFormat.PDF) {
      return this.pdfGenerator.generateUsersReport(data);
    }
    return this.excelGenerator.generateUsersReport(data);
  }

  private async getFinancialData(
    startDate?: string,
    endDate?: string
  ): Promise<FinancialReportData> {
    const whereClause: Record<string, unknown> = {};

    if (startDate && endDate) {
      whereClause.paymentDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereClause.paymentDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereClause.paymentDate = LessThanOrEqual(new Date(endDate));
    }

    const payments = await this.paymentRepository.find({
      where: whereClause,
      relations: ['membership', 'membership.user', 'membership.membershipType'],
      order: { paymentDate: 'DESC' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const methodSummary = new Map<string, { total: number; count: number }>();
    payments.forEach((p) => {
      const method = p.paymentMethod || 'No especificado';
      const current = methodSummary.get(method) || { total: 0, count: 0 };
      current.total += Number(p.amount);
      current.count += 1;
      methodSummary.set(method, current);
    });

    return {
      title: 'Reporte Financiero',
      generatedAt: new Date(),
      period: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      data: {
        totalRevenue,
        paymentCount: payments.length,
        payments: payments.map((p) => ({
          date: formatDate(p.paymentDate),
          userName: p.membership?.user?.name || 'Usuario desconocido',
          amount: Number(p.amount),
          method:
            PAYMENT_METHOD_TRANSLATIONS[p.paymentMethod] || p.paymentMethod || 'No especificado',
          membershipType: p.membership?.membershipType?.name || 'Sin tipo',
        })),
        summaryByMethod: Array.from(methodSummary.entries()).map(([method, data]) => ({
          method: PAYMENT_METHOD_TRANSLATIONS[method] || method,
          total: data.total,
          count: data.count,
        })),
      },
    };
  }

  private async getAttendanceData(
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceReportData> {
    const whereClause: Record<string, unknown> = { granted: true };

    if (startDate && endDate) {
      whereClause.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereClause.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereClause.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const accessLogs = await this.accessLogRepository.find({
      where: whereClause,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const uniqueUserIds = new Set(accessLogs.map((log) => log.userId));

    const dayOfWeekCounts = new Map<number, number>();
    const monthlyCounts = new Map<string, number[]>();

    accessLogs.forEach((log) => {
      const date = new Date(log.createdAt);
      const dayOfWeek = date.getDay();
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyCounts.has(monthKey)) {
        monthlyCounts.set(monthKey, []);
      }
      monthlyCounts.get(monthKey)?.push(1);
    });

    return {
      title: 'Reporte de Asistencia',
      generatedAt: new Date(),
      period: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      data: {
        totalAttendances: accessLogs.length,
        uniqueUsers: uniqueUserIds.size,
        attendances: accessLogs.map((log) => ({
          date: formatDate(log.createdAt),
          userName: log.user?.name || 'Usuario desconocido',
          checkInTime: formatTime(log.createdAt),
        })),
        byDayOfWeek: Array.from({ length: 7 }, (_, i) => ({
          day: DAY_OF_WEEK_NAMES[i],
          count: dayOfWeekCounts.get(i) || 0,
        })),
        monthlyAverages: Array.from(monthlyCounts.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, counts]) => {
            const [year, month] = key.split('-');
            return {
              month: `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`,
              average: counts.length / 30,
            };
          }),
      },
    };
  }

  private async getUsersData(): Promise<UsersReportData> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('memberships', 'membership', 'membership.userId = user.id')
      .leftJoin(
        'membership_types',
        'membershipType',
        'membershipType.id = membership.membershipTypeId'
      )
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.isActive',
        'membership.id',
        'membership.status',
        'membership.endDate',
        'membershipType.name',
      ])
      .where('user.isActive = :isActive', { isActive: true })
      .orderBy('user.name', 'ASC')
      .getRawMany<RawUserMembershipResult>();

    const userMap = new Map<
      string,
      {
        name: string;
        email: string;
        memberships: Array<{ status: string; endDate: Date; typeName: string }>;
      }
    >();

    users.forEach((row) => {
      const userId = row.user_id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          name: row.user_name,
          email: row.user_email,
          memberships: [],
        });
      }

      if (row.membership_id && row.membership_status && row.membership_endDate) {
        userMap.get(userId)?.memberships.push({
          status: row.membership_status,
          endDate: row.membership_endDate,
          typeName: row.membershipType_name || 'Sin tipo',
        });
      }
    });

    const membershipTypeCounts = new Map<string, number>();
    const processedUsers: UsersReportData['data']['users'] = [];
    let activeCount = 0;

    userMap.forEach((userData) => {
      let relevantMembership = userData.memberships.find((m) => m.status === 'active');
      if (!relevantMembership) {
        relevantMembership = userData.memberships.find((m) => m.status === 'grace_period');
      }
      if (!relevantMembership && userData.memberships.length > 0) {
        relevantMembership = userData.memberships.sort(
          (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        )[0];
      }

      const typeName = relevantMembership?.typeName || 'Sin membresía';
      membershipTypeCounts.set(typeName, (membershipTypeCounts.get(typeName) || 0) + 1);

      if (relevantMembership?.status === 'active') {
        activeCount++;
      }

      processedUsers.push({
        name: userData.name,
        email: userData.email,
        membershipType: typeName,
        membershipStatus: relevantMembership
          ? MEMBERSHIP_STATUS_TRANSLATIONS[relevantMembership.status] || relevantMembership.status
          : 'Sin membresía',
        membershipEndDate: relevantMembership?.endDate
          ? formatDate(relevantMembership.endDate)
          : '',
      });
    });

    return {
      title: 'Reporte de Usuarios',
      generatedAt: new Date(),
      data: {
        totalUsers: userMap.size,
        activeUsers: activeCount,
        users: processedUsers,
        summaryByMembershipType: Array.from(membershipTypeCounts.entries()).map(
          ([type, count]) => ({
            type,
            count,
          })
        ),
      },
    };
  }

  getContentType(format: ReportFormat): string {
    return format === ReportFormat.PDF
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  getFileExtension(format: ReportFormat): string {
    return format === ReportFormat.PDF ? 'pdf' : 'xlsx';
  }
}
