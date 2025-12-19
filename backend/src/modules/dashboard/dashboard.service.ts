import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Membership, MembershipStatus } from '../memberships/entities/membership.entity';
import { UserRoutine } from '../user-routines/entities/user-routine.entity';

interface RawRevenueResult {
  total: string;
}

interface RawPaymentMethodResult {
  method: string;
  count: string;
  total: string;
}

interface RawMonthlyRevenueResult {
  year: string;
  month: string;
  total: string;
}
import {
  FinancialDashboardDto,
  PaymentMethodDistributionDto,
  MonthlyRevenueDto,
  DebtorDto,
  ExpiringMembershipDto,
} from './dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(UserRoutine)
    private readonly userRoutineRepository: Repository<UserRoutine>
  ) {}

  async getFinancialDashboard(): Promise<FinancialDashboardDto> {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Ejecutar queries en paralelo
    const [
      currentMonthRevenue,
      previousMonthRevenue,
      todayRevenue,
      totalActiveMembers,
      activeRoutines,
      debtors,
      expiringMemberships,
      paymentMethodDistribution,
      monthlyRevenue,
    ] = await Promise.all([
      this.getCurrentMonthRevenue(currentMonthStart, currentMonthEnd),
      this.getMonthRevenue(previousMonthStart, previousMonthEnd),
      this.getTodayRevenue(today),
      this.getTotalActiveMembers(),
      this.getActiveRoutinesCount(),
      this.getDebtors(today),
      this.getExpiringMemberships(today),
      this.getPaymentMethodDistribution(currentMonthStart, currentMonthEnd),
      this.getMonthlyRevenue(6),
    ]);

    // Calcular porcentaje de crecimiento
    const revenueGrowthPercentage =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : currentMonthRevenue > 0
          ? 100
          : 0;

    return {
      currentMonthRevenue,
      previousMonthRevenue,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 100) / 100,
      todayRevenue,
      totalActiveMembers,
      totalDebtors: debtors.length,
      expiringInSevenDays: expiringMemberships.length,
      activeRoutines,
      paymentMethodDistribution,
      monthlyRevenue,
      debtors,
      expiringMemberships,
    };
  }

  private async getCurrentMonthRevenue(startDate: Date, endDate: Date): Promise<number> {
    return this.getMonthRevenue(startDate, endDate);
  }

  private async getMonthRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .getRawOne<RawRevenueResult>();

    return parseFloat(result?.total ?? '0') || 0;
  }

  private async getTotalActiveMembers(): Promise<number> {
    return this.membershipRepository.count({
      where: {
        status: MembershipStatus.ACTIVE,
      },
    });
  }

  private async getTodayRevenue(today: Date): Promise<number> {
    const todayStr = today.toISOString().split('T')[0];
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('DATE(payment.paymentDate) = :today', { today: todayStr })
      .getRawOne<RawRevenueResult>();

    return parseFloat(result?.total ?? '0') || 0;
  }

  private async getActiveRoutinesCount(): Promise<number> {
    return this.userRoutineRepository.count({
      where: {
        isActive: true,
      },
    });
  }

  private async getDebtors(today: Date): Promise<DebtorDto[]> {
    const memberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .innerJoinAndSelect('membership.user', 'user')
      .where('membership.status IN (:...statuses)', {
        statuses: [MembershipStatus.EXPIRED, MembershipStatus.GRACE_PERIOD],
      })
      .andWhere('membership.endDate < :today', {
        today: today.toISOString().split('T')[0],
      })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .orderBy('membership.endDate', 'ASC')
      .getMany();

    return memberships.map((m) => ({
      userId: m.userId,
      userName: m.user.name,
      userEmail: m.user.email,
      membershipEndDate: m.endDate,
      daysOverdue: Math.floor(
        (today.getTime() - new Date(m.endDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }

  private async getExpiringMemberships(today: Date): Promise<ExpiringMembershipDto[]> {
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const memberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .innerJoinAndSelect('membership.user', 'user')
      .innerJoinAndSelect('membership.membershipType', 'membershipType')
      .where('membership.status = :status', { status: MembershipStatus.ACTIVE })
      .andWhere('membership.endDate BETWEEN :today AND :sevenDays', {
        today: today.toISOString().split('T')[0],
        sevenDays: sevenDaysFromNow.toISOString().split('T')[0],
      })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .orderBy('membership.endDate', 'ASC')
      .getMany();

    return memberships.map((m) => ({
      userId: m.userId,
      userName: m.user.name,
      userEmail: m.user.email,
      membershipEndDate: m.endDate,
      daysUntilExpiration: Math.floor(
        (new Date(m.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
      membershipTypeName: m.membershipType.name,
    }));
  }

  private async getPaymentMethodDistribution(
    startDate: Date,
    endDate: Date
  ): Promise<PaymentMethodDistributionDto[]> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .groupBy('payment.paymentMethod')
      .getRawMany<RawPaymentMethodResult>();

    return result.map((r) => ({
      method: r.method,
      count: parseInt(r.count, 10),
      total: parseFloat(r.total) || 0,
    }));
  }

  private async getMonthlyRevenue(months: number): Promise<MonthlyRevenueDto[]> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('YEAR(payment.paymentDate)', 'year')
      .addSelect('MONTH(payment.paymentDate)', 'month')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentDate >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)', { months })
      .groupBy('YEAR(payment.paymentDate)')
      .addGroupBy('MONTH(payment.paymentDate)')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany<RawMonthlyRevenueResult>();

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

    return result.map((r) => ({
      month: monthNames[parseInt(r.month, 10) - 1],
      year: parseInt(r.year, 10),
      total: parseFloat(r.total) || 0,
    }));
  }
}
