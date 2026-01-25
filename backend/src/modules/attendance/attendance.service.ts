import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AccessLog } from '../access/entities/access-log.entity';
import { AccessService } from '../access/access.service';
import {
  AttendanceQueryDto,
  AttendanceStatsDto,
  DayOfWeekStatsDto,
  MonthlyAverageDto,
} from './dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

interface RawDayOfWeekResult {
  dayOfWeek: string;
  count: string;
}

interface RawMonthlyResult {
  year: string;
  month: string;
  totalAttendances: string;
  daysWithAttendance: string;
}

interface RawLowAttendanceResult {
  userId: string;
  visitCount: string;
  lastAttendanceDate: string | null;
  user_id: string;
  user_name: string;
  user_email: string;
}

export interface LowAttendanceUserData {
  userId: string;
  name: string;
  email: string;
  visitCount: number;
  lastAttendanceDate: Date | null;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    private readonly accessService: AccessService
  ) {}

  async getAttendance(query: AttendanceQueryDto): Promise<PaginatedResponse<AccessLog>> {
    return this.accessService.getAccessLogs({
      ...query,
      granted: true,
    });
  }

  async getUserAttendance(
    userId: string,
    query: AttendanceQueryDto
  ): Promise<PaginatedResponse<AccessLog>> {
    const { fromDate, toDate, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {
      userId,
      granted: true,
    };

    if (fromDate && toDate) {
      where.createdAt = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(fromDate));
    } else if (toDate) {
      where.createdAt = LessThanOrEqual(new Date(toDate));
    }

    const [data, total] = await this.accessLogRepository.findAndCount({
      where,
      relations: ['user', 'scannedBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(query: AttendanceQueryDto): Promise<AttendanceStatsDto> {
    const { fromDate, toDate } = query;

    const queryBuilder = this.accessLogRepository
      .createQueryBuilder('log')
      .where('log.granted = :granted', { granted: true });

    if (fromDate) {
      queryBuilder.andWhere('log.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }
    if (toDate) {
      queryBuilder.andWhere('log.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    const [totalAttendances, byDayOfWeek, monthlyAverages] = await Promise.all([
      queryBuilder.getCount(),
      this.getStatsByDayOfWeek(fromDate, toDate),
      this.getMonthlyAverages(fromDate, toDate),
    ]);

    return {
      totalAttendances,
      byDayOfWeek,
      monthlyAverages,
      periodStart: fromDate,
      periodEnd: toDate,
    };
  }

  private async getStatsByDayOfWeek(
    fromDate?: string,
    toDate?: string
  ): Promise<DayOfWeekStatsDto[]> {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const queryBuilder = this.accessLogRepository
      .createQueryBuilder('log')
      .select('DAYOFWEEK(log.createdAt)', 'dayOfWeek')
      .addSelect('COUNT(*)', 'count')
      .where('log.granted = :granted', { granted: true });

    if (fromDate) {
      queryBuilder.andWhere('log.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }
    if (toDate) {
      queryBuilder.andWhere('log.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    const results = await queryBuilder
      .groupBy('DAYOFWEEK(log.createdAt)')
      .orderBy('dayOfWeek', 'ASC')
      .getRawMany<RawDayOfWeekResult>();

    return results.map((r) => ({
      dayOfWeek: parseInt(r.dayOfWeek, 10),
      dayName: dayNames[parseInt(r.dayOfWeek, 10) - 1],
      count: parseInt(r.count, 10),
    }));
  }

  private async getMonthlyAverages(
    fromDate?: string,
    toDate?: string
  ): Promise<MonthlyAverageDto[]> {
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const queryBuilder = this.accessLogRepository
      .createQueryBuilder('log')
      .select('YEAR(log.createdAt)', 'year')
      .addSelect('MONTH(log.createdAt)', 'month')
      .addSelect('COUNT(*)', 'totalAttendances')
      .addSelect('COUNT(DISTINCT DATE(log.createdAt))', 'daysWithAttendance')
      .where('log.granted = :granted', { granted: true });

    if (fromDate) {
      queryBuilder.andWhere('log.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }
    if (toDate) {
      queryBuilder.andWhere('log.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    const results = await queryBuilder
      .groupBy('YEAR(log.createdAt)')
      .addGroupBy('MONTH(log.createdAt)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .limit(6)
      .getRawMany<RawMonthlyResult>();

    return results.map((r) => {
      const totalAttendances = parseInt(r.totalAttendances, 10);
      const daysWithAttendance = parseInt(r.daysWithAttendance, 10);
      return {
        month: monthNames[parseInt(r.month, 10) - 1],
        year: parseInt(r.year, 10),
        totalAttendances,
        averagePerDay:
          daysWithAttendance > 0
            ? Math.round((totalAttendances / daysWithAttendance) * 100) / 100
            : 0,
      };
    });
  }

  async getUserMonthlyCount(userId: string, month?: number, year?: number): Promise<number> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    return this.accessLogRepository.count({
      where: {
        userId,
        granted: true,
        createdAt: Between(startDate, endDate),
      },
    });
  }

  async findUsersWithLowAttendance(minVisits: number = 8): Promise<string[]> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const results = await this.accessLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'visitCount')
      .where('log.granted = :granted', { granted: true })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.userId')
      .having('COUNT(*) < :minVisits', { minVisits })
      .getRawMany<{ userId: string; visitCount: string }>();

    return results.map((r) => r.userId);
  }

  async findUsersWithLowAttendanceDetails(
    minVisits: number = 8,
    month?: number,
    year?: number
  ): Promise<LowAttendanceUserData[]> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const usersWithAttendance = await this.accessLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'visitCount')
      .addSelect('MAX(log.createdAt)', 'lastAttendanceDate')
      .innerJoin('log.user', 'user')
      .addSelect('user.id', 'user_id')
      .addSelect('user.name', 'user_name')
      .addSelect('user.email', 'user_email')
      .where('log.granted = :granted', { granted: true })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.role = :role', { role: 'user' })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.userId')
      .addGroupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.email')
      .having('COUNT(*) < :minVisits', { minVisits })
      .getRawMany<RawLowAttendanceResult>();

    return usersWithAttendance.map((row) => ({
      userId: row.userId,
      name: row.user_name,
      email: row.user_email,
      visitCount: parseInt(row.visitCount, 10),
      lastAttendanceDate: row.lastAttendanceDate ? new Date(row.lastAttendanceDate) : null,
    }));
  }

  async getLastAttendanceDate(userId: string): Promise<Date | null> {
    const lastLog = await this.accessLogRepository.findOne({
      where: { userId, granted: true },
      order: { createdAt: 'DESC' },
    });
    return lastLog?.createdAt ?? null;
  }
}
