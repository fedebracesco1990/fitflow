import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Membership, MembershipStatus } from '../memberships/entities/membership.entity';
import { UserProgram } from '../programs/entities/user-program.entity';
import { Routine } from '../routines/entities/routine.entity';
import { PersonalRecord } from '../personal-records/entities/personal-record.entity';
import { Role } from '../../common/enums/role.enum';

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
  ReportsDataDto,
  RevenueItemDto,
  AttendanceItemDto,
  MembershipItemDto,
  DashboardStatsDto,
  FinancialReportDto,
  TransactionItemDto,
  BehaviorReportDto,
  MemberAnalysisDto,
  AdminDashboardDto,
  TrainerDashboardDto,
  TrainerStudentSummaryDto,
  UnifiedDashboardDto,
} from './dto';
import * as ExcelJS from 'exceljs';
import { AccessLog } from '../access/entities/access-log.entity';

interface RawRevenueResult {
  year: string;
  month: string;
  total: string;
}

interface RawAttendanceResult {
  date: string;
  count: string;
}

interface RawMembershipResult {
  status: string;
  count: string;
  total: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(UserProgram)
    private readonly userProgramRepository: Repository<UserProgram>,
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(PersonalRecord)
    private readonly personalRecordRepository: Repository<PersonalRecord>
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

  async getStats(): Promise<DashboardStatsDto> {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Ejecutar queries en paralelo
    const [
      currentMonthRevenue,
      todayRevenue,
      totalActiveMembers,
      activeRoutines,
      debtors,
      expiringMemberships,
    ] = await Promise.all([
      this.getCurrentMonthRevenue(currentMonthStart, currentMonthEnd),
      this.getTodayRevenue(today),
      this.getTotalActiveMembers(),
      this.getActiveRoutinesCount(),
      this.getDebtors(today),
      this.getExpiringMemberships(today),
    ]);

    return {
      miembrosActivos: totalActiveMembers,
      expiranPronto: expiringMemberships.length,
      morosos: debtors.length,
      ingresosMes: currentMonthRevenue,
      ingresosHoy: todayRevenue,
      rutinasActivas: activeRoutines,
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
    return this.userProgramRepository.count({
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

  async getReportsData(startDate?: Date, endDate?: Date): Promise<ReportsDataDto> {
    const [revenue, attendance, memberships] = await Promise.all([
      this.getRevenueData(startDate, endDate),
      this.getAttendanceData(startDate, endDate),
      this.getMembershipsData(),
    ]);

    return {
      revenue,
      attendance,
      memberships,
    };
  }

  private async getRevenueData(startDate?: Date, endDate?: Date): Promise<RevenueItemDto[]> {
    let query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('EXTRACT(YEAR FROM payment.paymentDate)', 'year')
      .addSelect('EXTRACT(MONTH FROM payment.paymentDate)', 'month')
      .addSelect('SUM(payment.amount)', 'total');

    if (startDate) {
      query = query.andWhere('payment.paymentDate >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('payment.paymentDate <= :endDate', { endDate });
    }

    const result = await query
      .groupBy('EXTRACT(YEAR FROM payment.paymentDate)')
      .addGroupBy('EXTRACT(MONTH FROM payment.paymentDate)')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany<RawRevenueResult>();

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

  private async getAttendanceData(startDate?: Date, endDate?: Date): Promise<AttendanceItemDto[]> {
    let query = this.accessLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.granted = :granted', { granted: true });

    if (startDate) {
      query = query.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('log.createdAt <= :endDate', { endDate });
    }

    const result = await query
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany<RawAttendanceResult>();

    return result.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
  }

  private async getMembershipsData(): Promise<MembershipItemDto[]> {
    const result = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoin('membership.membershipType', 'type')
      .select('membership.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(type.price)', 'total')
      .groupBy('membership.status')
      .getRawMany<RawMembershipResult>();

    const statusTranslations: Record<string, string> = {
      active: 'Activa',
      expired: 'Vencida',
      cancelled: 'Cancelada',
      grace_period: 'Período de Gracia',
    };

    return result.map((r) => ({
      status: statusTranslations[r.status] || r.status,
      count: parseInt(r.count, 10),
      total: parseFloat(r.total) || 0,
    }));
  }

  async exportReports(startDate?: Date, endDate?: Date): Promise<Buffer> {
    const data = await this.getReportsData(startDate, endDate);

    const workbook = new ExcelJS.Workbook();

    const revenueSheet = workbook.addWorksheet('Ingresos');
    revenueSheet.columns = [
      { header: 'Mes', key: 'month', width: 15 },
      { header: 'Año', key: 'year', width: 10 },
      { header: 'Total', key: 'total', width: 15 },
    ];
    revenueSheet.addRows(data.revenue);

    const attendanceSheet = workbook.addWorksheet('Asistencia');
    attendanceSheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Cantidad', key: 'count', width: 15 },
    ];
    attendanceSheet.addRows(data.attendance);

    const membershipsSheet = workbook.addWorksheet('Membresías');
    membershipsSheet.columns = [
      { header: 'Estado', key: 'status', width: 20 },
      { header: 'Cantidad', key: 'count', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];
    membershipsSheet.addRows(data.memberships);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getFinancialReport(month?: number, year?: number): Promise<FinancialReportDto> {
    const today = new Date();
    const targetMonth = month ?? today.getMonth() + 1;
    const targetYear = year ?? today.getFullYear();

    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const [payments, debtorsCount] = await Promise.all([
      this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.membership', 'membership')
        .leftJoinAndSelect('membership.user', 'user')
        .where('payment.paymentDate >= :start', { start: monthStart })
        .andWhere('payment.paymentDate <= :end', { end: monthEnd })
        .orderBy('payment.paymentDate', 'DESC')
        .getMany(),
      this.membershipRepository
        .createQueryBuilder('membership')
        .where('membership.status = :status', { status: MembershipStatus.EXPIRED })
        .andWhere('membership.endDate < :today', { today: new Date() })
        .getCount(),
    ]);

    const ingresoTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const transacciones = payments.length;

    const desglose: TransactionItemDto[] = payments.map((p) => ({
      fecha: p.paymentDate,
      monto: Number(p.amount),
      metodo: p.paymentMethod,
      miembro: p.membership?.user?.email || 'N/A',
    }));

    return {
      ingresoTotal,
      transacciones,
      morososActuales: debtorsCount,
      desglose,
    };
  }

  async getBehaviorReport(startDate?: Date, endDate?: Date): Promise<BehaviorReportDto> {
    const today = new Date();
    const start = startDate ?? new Date(today.getFullYear(), today.getMonth(), 1);
    const end = endDate ?? new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [activeMemberships, expiredMemberships, activeRoutines, accessLogs, allUsers] =
      await Promise.all([
        this.getMembershipsByStatus(MembershipStatus.ACTIVE),
        this.membershipRepository
          .createQueryBuilder('membership')
          .leftJoinAndSelect('membership.user', 'user')
          .where('membership.status = :status', { status: MembershipStatus.EXPIRED })
          .andWhere('membership.endDate < :today', { today: new Date() })
          .getMany(),
        this.userProgramRepository
          .createQueryBuilder('userRoutine')
          .where('userRoutine.isActive = :active', { active: true })
          .getCount(),
        this.accessLogRepository
          .createQueryBuilder('log')
          .leftJoinAndSelect('log.user', 'user')
          .where('log.createdAt >= :start', { start })
          .andWhere('log.createdAt <= :end', { end })
          .getMany(),
        this.membershipRepository
          .createQueryBuilder('membership')
          .leftJoinAndSelect('membership.user', 'user')
          .getMany(),
      ]);

    const activeUserIds = activeMemberships.map((m) => m.user.id);
    const expiredUserIds = expiredMemberships.map((m) => m.user.id);

    const activeVisits = accessLogs.filter((log) => activeUserIds.includes(log.user.id));
    const expiredVisits = accessLogs.filter((log) => expiredUserIds.includes(log.user.id));

    const activeUsersWithVisits = new Set(activeVisits.map((log) => log.user.id));
    const expiredUsersWithVisits = new Set(expiredVisits.map((log) => log.user.id));

    const visitasPromActivos =
      activeUsersWithVisits.size > 0 ? activeVisits.length / activeUsersWithVisits.size : 0;
    const visitasPromMorosos =
      expiredUsersWithVisits.size > 0 ? expiredVisits.length / expiredUsersWithVisits.size : 0;

    const userVisitCounts = new Map<string, number>();
    accessLogs.forEach((log) => {
      const count = userVisitCounts.get(log.user.id) || 0;
      userVisitCounts.set(log.user.id, count + 1);
    });

    const userRoutinesMap = new Map<string, boolean>();
    const userRoutines = await this.userProgramRepository
      .createQueryBuilder('userRoutine')
      .where('userRoutine.isActive = :active', { active: true })
      .getMany();

    userRoutines.forEach((routine) => {
      userRoutinesMap.set(routine.userId, true);
    });

    const analisis: MemberAnalysisDto[] = allUsers.map((membership) => {
      const user = membership.user;
      const visitasTotales = userVisitCounts.get(user.id) || 0;
      const hasActiveRoutine = userRoutinesMap.get(user.id) || false;

      return {
        userId: user.id,
        miembro: user.email.split('@')[0],
        email: user.email,
        estado: this.mapMembershipStatusToReportStatus(membership.status),
        visitasTotales,
        rutinaActiva: hasActiveRoutine,
        membershipEndDate: membership.endDate,
      };
    });

    return {
      visitasPromActivos: this.roundToOneDecimal(visitasPromActivos),
      visitasPromMorosos: this.roundToOneDecimal(visitasPromMorosos),
      rutinasActivas: activeRoutines,
      analisis,
      totalMembers: allUsers.length,
    };
  }

  async exportReportToCsv(
    type: 'financial' | 'behavior',
    filters: {
      month?: number;
      year?: number;
      startDate?: Date;
      endDate?: Date;
      status?: 'ACTIVE' | 'OVERDUE' | 'INACTIVE';
    }
  ): Promise<string> {
    let csvContent = '';

    if (type === 'financial') {
      const report = await this.getFinancialReport(filters.month, filters.year);
      csvContent = 'Fecha,Monto,Método,Miembro\n';
      report.desglose.forEach((item) => {
        const fecha = new Date(item.fecha).toLocaleDateString('es-AR');
        csvContent += `${fecha},${item.monto},${item.metodo},${item.miembro}\n`;
      });
    } else {
      const report = await this.getBehaviorReport(filters.startDate, filters.endDate);
      let analisisData = report.analisis;

      if (filters.status) {
        analisisData = analisisData.filter((item) => item.estado === filters.status);
      }

      csvContent = 'Miembro,Email,Estado,Visitas Totales,Rutina Activa\n';
      analisisData.forEach((item) => {
        csvContent += `${item.miembro},${item.email},${item.estado},${item.visitasTotales},${item.rutinaActiva ? 'Sí' : 'No'}\n`;
      });
    }

    return csvContent;
  }

  private roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private mapMembershipStatusToReportStatus(
    status: MembershipStatus
  ): 'ACTIVE' | 'OVERDUE' | 'INACTIVE' {
    if (status === MembershipStatus.ACTIVE) {
      return 'ACTIVE';
    } else if (status === MembershipStatus.EXPIRED) {
      return 'OVERDUE';
    }
    return 'INACTIVE';
  }

  private async getMembershipsByStatus(status: MembershipStatus): Promise<Membership[]> {
    return this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .where('membership.status = :status', { status })
      .getMany();
  }

  async getUnifiedDashboard(userId: string, role: Role): Promise<UnifiedDashboardDto> {
    if (role === Role.ADMIN) {
      return this.getAdminDashboard();
    }
    return this.getTrainerDashboard(userId);
  }

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      ingresosMes,
      ingresosHoy,
      debtors,
      miembrosActivos,
      expiringMemberships,
      rutinasActivas,
      prsDelMes,
      asistenciasHoy,
      ingresosMensuales,
      distribucionMetodosPago,
    ] = await Promise.all([
      this.getCurrentMonthRevenue(currentMonthStart, currentMonthEnd),
      this.getTodayRevenue(today),
      this.getDebtors(today),
      this.getTotalActiveMembers(),
      this.getExpiringMemberships(today),
      this.getActiveRoutinesCount(),
      this.getPRsThisMonth(currentMonthStart, currentMonthEnd),
      this.getTodayAttendance(today),
      this.getMonthlyRevenue(6),
      this.getPaymentMethodDistribution(currentMonthStart, currentMonthEnd),
    ]);

    const daysInMonth = currentMonthEnd.getDate();
    const currentDay = today.getDate();
    const proyeccionMes = currentDay > 0 ? Math.round((ingresosMes / currentDay) * daysInMonth) : 0;

    return {
      role: 'admin',
      ingresosMes,
      ingresosHoy,
      morosos: debtors.length,
      proyeccionMes,
      asistenciasHoy,
      miembrosActivos,
      expiranPronto: expiringMemberships.length,
      rutinasActivas,
      prsDelMes,
      ingresosMensuales,
      distribucionMetodosPago,
    };
  }

  async getTrainerDashboard(trainerId: string): Promise<TrainerDashboardDto> {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [trainerStudents, rutinasActivasCreadas, prsAlumnosMes] = await Promise.all([
      this.getTrainerStudents(trainerId),
      this.getTrainerActiveRoutinesCount(trainerId),
      this.getTrainerStudentsPRsThisMonth(trainerId, currentMonthStart, currentMonthEnd),
    ]);

    const alumnosActivos = trainerStudents.filter((s) => s.tieneRutinaActiva).length;

    return {
      role: 'trainer',
      totalAlumnos: trainerStudents.length,
      alumnosActivos,
      rutinasActivasCreadas,
      prsAlumnosMes,
      alumnosRecientes: trainerStudents.slice(0, 10),
    };
  }

  private async getPRsThisMonth(startDate: Date, endDate: Date): Promise<number> {
    const count = await this.personalRecordRepository
      .createQueryBuilder('pr')
      .where(
        '(pr.maxWeightAchievedAt BETWEEN :start AND :end OR pr.maxVolumeAchievedAt BETWEEN :start AND :end)',
        { start: startDate, end: endDate }
      )
      .getCount();
    return count;
  }

  private async getTodayAttendance(today: Date): Promise<number> {
    const todayStr = today.toISOString().split('T')[0];
    const count = await this.accessLogRepository
      .createQueryBuilder('log')
      .where('DATE(log.createdAt) = :today', { today: todayStr })
      .andWhere('log.granted = :granted', { granted: true })
      .getCount();
    return count;
  }

  private async getTrainerStudents(trainerId: string): Promise<TrainerStudentSummaryDto[]> {
    const routinesCreatedByTrainer = await this.routineRepository
      .createQueryBuilder('routine')
      .select('routine.id')
      .where('routine.createdById = :trainerId', { trainerId })
      .getMany();

    if (routinesCreatedByTrainer.length === 0) {
      return [];
    }

    const routineIds = routinesCreatedByTrainer.map((r) => r.id);

    const userRoutines = await this.userProgramRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.user', 'user')
      .leftJoinAndSelect('ur.routine', 'routine')
      .where('ur.routineId IN (:...routineIds)', { routineIds })
      .orderBy('ur.createdAt', 'DESC')
      .getMany();

    const studentMap = new Map<string, TrainerStudentSummaryDto>();

    for (const ur of userRoutines) {
      const userId = ur.userId;
      if (!studentMap.has(userId)) {
        studentMap.set(userId, {
          userId,
          userName: ur.user.name,
          userEmail: ur.user.email,
          rutinasAsignadas: 0,
          ultimaActividad: null,
          tieneRutinaActiva: false,
        });
      }

      const student = studentMap.get(userId)!;
      student.rutinasAsignadas++;

      if (ur.isActive) {
        student.tieneRutinaActiva = true;
      }

      if (!student.ultimaActividad || ur.createdAt > student.ultimaActividad) {
        student.ultimaActividad = ur.createdAt;
      }
    }

    return Array.from(studentMap.values()).sort((a, b) => {
      if (!a.ultimaActividad) return 1;
      if (!b.ultimaActividad) return -1;
      return b.ultimaActividad.getTime() - a.ultimaActividad.getTime();
    });
  }

  private async getTrainerActiveRoutinesCount(trainerId: string): Promise<number> {
    const count = await this.routineRepository
      .createQueryBuilder('routine')
      .where('routine.createdById = :trainerId', { trainerId })
      .andWhere('routine.isActive = :isActive', { isActive: true })
      .andWhere('routine.isTemplate = :isTemplate', { isTemplate: false })
      .getCount();
    return count;
  }

  private async getTrainerStudentsPRsThisMonth(
    trainerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const routinesCreatedByTrainer = await this.routineRepository
      .createQueryBuilder('routine')
      .select('routine.id')
      .where('routine.createdById = :trainerId', { trainerId })
      .getMany();

    if (routinesCreatedByTrainer.length === 0) {
      return 0;
    }

    const routineIds = routinesCreatedByTrainer.map((r) => r.id);

    const userRoutines = await this.userProgramRepository
      .createQueryBuilder('ur')
      .select('DISTINCT ur.userId', 'userId')
      .where('ur.routineId IN (:...routineIds)', { routineIds })
      .getRawMany<{ userId: string }>();

    if (userRoutines.length === 0) {
      return 0;
    }

    const userIds = userRoutines.map((ur) => ur.userId);

    const count = await this.personalRecordRepository
      .createQueryBuilder('pr')
      .where('pr.userId IN (:...userIds)', { userIds })
      .andWhere(
        '(pr.maxWeightAchievedAt BETWEEN :start AND :end OR pr.maxVolumeAchievedAt BETWEEN :start AND :end)',
        { start: startDate, end: endDate }
      )
      .getCount();

    return count;
  }
}
