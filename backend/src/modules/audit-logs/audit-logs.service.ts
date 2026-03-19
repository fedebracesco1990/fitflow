import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

export interface LogActionParams {
  action: AuditAction;
  entity: string;
  entityId?: string;
  performedById?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  async log(params: LogActionParams): Promise<void> {
    const entry = this.auditLogRepository.create({
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      performedById: params.performedById ?? null,
      details: params.details ?? null,
    });
    await this.auditLogRepository.save(entry);
  }

  async findAll(
    page = 1,
    limit = 50,
    filters?: { entity?: string; action?: AuditAction; performedById?: string }
  ): Promise<PaginatedResponse<AuditLog>> {
    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.performedBy', 'performedBy')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.entity) {
      qb.andWhere('log.entity = :entity', { entity: filters.entity });
    }
    if (filters?.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters?.performedById) {
      qb.andWhere('log.performedById = :performedById', {
        performedById: filters.performedById,
      });
    }

    const [data, total] = await qb.getManyAndCount();

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
}
