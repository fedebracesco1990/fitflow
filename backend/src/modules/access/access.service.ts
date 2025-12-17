import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AccessLog } from './entities/access-log.entity';
import { QrService } from '../qr/qr.service';
import { MembershipsService } from '../memberships/memberships.service';
import { UsersService } from '../users/users.service';
import { AccessLogsQueryDto } from './dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { MembershipStatus } from '../memberships/entities/membership.entity';
import { User } from '../users/entities/user.entity';

export interface ValidateQrResult {
  granted: boolean;
  reason: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  membership: {
    id: string;
    status: MembershipStatus;
    endDate: Date;
    typeName: string;
  } | null;
}

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    private readonly qrService: QrService,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService
  ) {}

  async validateQrAccess(token: string, scannedById: string): Promise<ValidateQrResult> {
    const payload = this.qrService.validateQrToken(token);

    if (!payload) {
      await this.logAccess(null, scannedById, false, 'Token QR inválido o expirado');
      return {
        granted: false,
        reason: 'Token QR inválido o expirado',
        user: null,
        membership: null,
      };
    }

    let user: User;
    try {
      user = await this.usersService.findById(payload.userId);
    } catch {
      await this.logAccess(payload.userId, scannedById, false, 'Usuario no encontrado');
      return {
        granted: false,
        reason: 'Usuario no encontrado',
        user: null,
        membership: null,
      };
    }

    const membership = await this.membershipsService.findActiveByUser(payload.userId);

    if (!membership) {
      await this.logAccess(payload.userId, scannedById, false, 'Sin membresía activa');
      return {
        granted: false,
        reason: 'Sin membresía activa',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        membership: null,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(membership.endDate);

    if (endDate < today) {
      await this.logAccess(payload.userId, scannedById, false, 'Membresía vencida');
      return {
        granted: false,
        reason: 'Membresía vencida',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        membership: {
          id: membership.id,
          status: membership.status,
          endDate: membership.endDate,
          typeName: membership.membershipType?.name || 'Desconocido',
        },
      };
    }

    await this.logAccess(payload.userId, scannedById, true, 'Acceso permitido');

    return {
      granted: true,
      reason: 'Acceso permitido',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      membership: {
        id: membership.id,
        status: membership.status,
        endDate: membership.endDate,
        typeName: membership.membershipType?.name || 'Desconocido',
      },
    };
  }

  private async logAccess(
    userId: string | null,
    scannedById: string,
    granted: boolean,
    reason: string
  ): Promise<void> {
    if (!userId) return;

    const log = this.accessLogRepository.create({
      userId,
      scannedById,
      granted,
      reason,
    });

    await this.accessLogRepository.save(log);
  }

  async getAccessLogs(query: AccessLogsQueryDto): Promise<PaginatedResponse<AccessLog>> {
    const { userId, fromDate, toDate, granted, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (granted !== undefined) {
      where.granted = granted;
    }

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
}
