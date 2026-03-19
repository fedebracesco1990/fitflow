import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthAuditLog, AuditEventType } from './entities/auth-audit-log.entity';

export interface LogAuditEventDto {
  event: AuditEventType;
  email?: string | null;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthAuditLogService {
  private readonly logger = new Logger(AuthAuditLogService.name);

  constructor(
    @InjectRepository(AuthAuditLog)
    private readonly auditLogRepository: Repository<AuthAuditLog>
  ) {}

  async log(dto: LogAuditEventDto): Promise<void> {
    try {
      const entry = this.auditLogRepository.create(dto);
      await this.auditLogRepository.save(entry);
    } catch (error) {
      this.logger.error('[AUDIT] Failed to save audit log entry', error);
    }
  }
}
