import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MembershipsService } from '../memberships/memberships.service';
import { AttendanceService } from '../attendance/attendance.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification-template.entity';

const EXPIRATION_DAYS_AHEAD = 3;
const MIN_MONTHLY_VISITS = 8;

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly attendanceService: AttendanceService,
    private readonly notificationsService: NotificationsService
  ) {}

  @Cron('0 8 * * *', {
    name: 'checkExpiringMemberships',
    timeZone: 'America/Montevideo',
  })
  async handleExpiringMemberships(): Promise<void> {
    this.logger.log(
      `[CRON] Starting expiring memberships check (${EXPIRATION_DAYS_AHEAD} days ahead)`
    );

    try {
      const expiringMemberships =
        await this.membershipsService.findExpiringMemberships(EXPIRATION_DAYS_AHEAD);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(today.getTime() + EXPIRATION_DAYS_AHEAD * 24 * 60 * 60 * 1000);

      const expiringOnTargetDate = expiringMemberships.filter((membership) => {
        const endDate = new Date(membership.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate.getTime() === targetDate.getTime();
      });

      this.logger.log(
        `[CRON] Found ${expiringOnTargetDate.length} memberships expiring in exactly ${EXPIRATION_DAYS_AHEAD} days`
      );

      let sent = 0;
      for (const membership of expiringOnTargetDate) {
        try {
          await this.notificationsService.sendByTemplate(
            membership.userId,
            NotificationType.MEMBERSHIP_EXPIRING
          );
          sent++;
          this.logger.log(`[CRON] Sent expiring notification to user ${membership.userId}`);
        } catch (error) {
          this.logger.error(
            `[CRON] Failed to send expiring notification to user ${membership.userId}`,
            error
          );
        }
      }

      this.logger.log(
        `[CRON] Expiring memberships check complete. Sent ${sent}/${expiringOnTargetDate.length} notifications`
      );
    } catch (error) {
      this.logger.error('[CRON] Error in expiring memberships check', error);
    }
  }

  @Cron('0 8 * * *', {
    name: 'checkExpiredMemberships',
    timeZone: 'America/Montevideo',
  })
  async handleExpiredMemberships(): Promise<void> {
    this.logger.log('[CRON] Starting expired memberships check');

    try {
      const updated = await this.membershipsService.updateExpiredMemberships();
      this.logger.log(`[CRON] Updated ${updated} memberships to EXPIRED status`);

      const expiredToday = await this.getExpiredToday();

      this.logger.log(`[CRON] Found ${expiredToday.length} memberships that expired today`);

      let sent = 0;
      for (const membership of expiredToday) {
        try {
          await this.notificationsService.sendByTemplate(
            membership.userId,
            NotificationType.MEMBERSHIP_EXPIRED
          );
          sent++;
          this.logger.log(`[CRON] Sent expired notification to user ${membership.userId}`);
        } catch (error) {
          this.logger.error(
            `[CRON] Failed to send expired notification to user ${membership.userId}`,
            error
          );
        }
      }

      this.logger.log(
        `[CRON] Expired memberships check complete. Sent ${sent}/${expiredToday.length} notifications`
      );
    } catch (error) {
      this.logger.error('[CRON] Error in expired memberships check', error);
    }
  }

  @Cron('0 9 * * 1', {
    name: 'checkWeeklyLowAttendance',
    timeZone: 'America/Montevideo',
  })
  async handleWeeklyLowAttendanceCheck(): Promise<void> {
    this.logger.log(
      `[CRON] Starting weekly low attendance check (<${MIN_MONTHLY_VISITS} visits/month)`
    );

    try {
      const usersWithLowAttendance =
        await this.attendanceService.findUsersWithLowAttendance(MIN_MONTHLY_VISITS);

      this.logger.log(
        `[CRON] Weekly check: Found ${usersWithLowAttendance.length} users with low attendance`
      );

      let sent = 0;
      for (const userId of usersWithLowAttendance) {
        try {
          await this.notificationsService.sendByTemplate(userId, NotificationType.LOW_ATTENDANCE);
          sent++;
          this.logger.log(`[CRON] Sent low attendance notification to user ${userId}`);
        } catch (error) {
          this.logger.error(
            `[CRON] Failed to send low attendance notification to user ${userId}`,
            error
          );
        }
      }

      this.logger.log(
        `[CRON] Weekly low attendance check complete. Sent ${sent}/${usersWithLowAttendance.length} notifications`
      );
    } catch (error) {
      this.logger.error('[CRON] Error in weekly low attendance check', error);
    }
  }

  @Cron('0 9 1 * *', {
    name: 'checkMonthlyLowAttendance',
    timeZone: 'America/Montevideo',
  })
  async handleMonthlyLowAttendanceCheck(): Promise<void> {
    const now = new Date();
    const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    this.logger.log(
      `[CRON] Starting monthly low attendance check for ${previousMonth}/${previousYear} (<${MIN_MONTHLY_VISITS} visits)`
    );

    try {
      const usersWithLowAttendance = await this.attendanceService.findUsersWithLowAttendanceDetails(
        MIN_MONTHLY_VISITS,
        previousMonth,
        previousYear
      );

      this.logger.log(
        `[CRON] Monthly check: Found ${usersWithLowAttendance.length} users with low attendance in ${previousMonth}/${previousYear}`
      );

      let sent = 0;
      for (const user of usersWithLowAttendance) {
        try {
          await this.notificationsService.sendByTemplate(
            user.userId,
            NotificationType.LOW_ATTENDANCE
          );
          sent++;
          this.logger.log(
            `[CRON] Sent monthly low attendance notification to user ${user.userId} (${user.name}, ${user.visitCount} visits)`
          );
        } catch (error) {
          this.logger.error(
            `[CRON] Failed to send monthly low attendance notification to user ${user.userId}`,
            error
          );
        }
      }

      this.logger.log(
        `[CRON] Monthly low attendance check complete. Sent ${sent}/${usersWithLowAttendance.length} notifications`
      );
    } catch (error) {
      this.logger.error('[CRON] Error in monthly low attendance check', error);
    }
  }

  private async getExpiredToday(): Promise<{ userId: string }[]> {
    const expiringToday = await this.membershipsService.findExpiringMemberships(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expiringToday
      .filter((membership) => {
        const endDate = new Date(membership.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate.getTime() === today.getTime();
      })
      .map((m) => ({ userId: m.userId }));
  }
}
