import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Membership, MembershipStatus } from '../memberships/entities/membership.entity';
import { MembershipType } from '../membership-types/entities/membership-type.entity';
import { CreatePaymentDto, CreatePaymentWithMembershipUpdateDto, UpdatePaymentDto } from './dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(MembershipType)
    private readonly membershipTypeRepository: Repository<MembershipType>,
    private readonly dataSource: DataSource,
    private readonly auditLogsService: AuditLogsService
  ) {}

  async create(createDto: CreatePaymentDto, registeredById: string): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que la membresía existe
      const membership = await queryRunner.manager.findOne(Membership, {
        where: { id: createDto.membershipId },
      });
      if (!membership) {
        throw new NotFoundException(`Membresía con ID "${createDto.membershipId}" no encontrada`);
      }

      const payment = queryRunner.manager.create(Payment, {
        ...createDto,
        paymentDate: new Date(createDto.paymentDate),
        coverageStart: new Date(createDto.coverageStartDate),
        coverageEnd: new Date(createDto.coverageEndDate),
        registeredById,
      });

      const savedPayment = await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

      await this.auditLogsService.log({
        action: AuditAction.CREATE,
        entity: 'Payment',
        entityId: savedPayment.id,
        performedById: registeredById,
        details: {
          membershipId: savedPayment.membershipId,
          amount: savedPayment.amount,
          paymentMethod: savedPayment.paymentMethod,
          paymentDate: savedPayment.paymentDate,
        },
      });

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createWithMembershipUpdate(
    createDto: CreatePaymentWithMembershipUpdateDto,
    registeredById: string
  ): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que la membresía existe
      const membership = await queryRunner.manager.findOne(Membership, {
        where: { id: createDto.membershipId },
        relations: ['membershipType'],
      });
      if (!membership) {
        throw new NotFoundException(`Membresía con ID "${createDto.membershipId}" no encontrada`);
      }

      // Si se solicita cambio de tipo de membresía
      if (
        createDto.newMembershipTypeId &&
        createDto.newMembershipTypeId !== membership.membershipTypeId
      ) {
        const newType = await queryRunner.manager.findOne(MembershipType, {
          where: { id: createDto.newMembershipTypeId, isActive: true },
        });
        if (!newType) {
          throw new NotFoundException(
            `Tipo de membresía con ID "${createDto.newMembershipTypeId}" no encontrado o no está activo`
          );
        }

        membership.membershipTypeId = newType.id;
      }

      // Reactivar membresía y actualizar fechas de cobertura
      membership.status = MembershipStatus.ACTIVE;
      membership.startDate = new Date(createDto.coverageStartDate);
      membership.endDate = new Date(createDto.coverageEndDate);
      await queryRunner.manager.save(membership);

      // Crear el pago
      const payment = queryRunner.manager.create(Payment, {
        membershipId: createDto.membershipId,
        amount: createDto.amount,
        paymentMethod: createDto.paymentMethod,
        paymentDate: new Date(createDto.paymentDate),
        coverageStart: new Date(createDto.coverageStartDate),
        coverageEnd: new Date(createDto.coverageEndDate),
        reference: createDto.reference,
        notes: createDto.notes,
        registeredById,
      });

      const savedPayment = await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

      await this.auditLogsService.log({
        action: AuditAction.CREATE,
        entity: 'Payment',
        entityId: savedPayment.id,
        performedById: registeredById,
        details: {
          membershipId: savedPayment.membershipId,
          amount: savedPayment.amount,
          paymentMethod: savedPayment.paymentMethod,
          paymentDate: savedPayment.paymentDate,
          source: 'createWithMembershipUpdate',
        },
      });

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page = 1, limit = 20): Promise<PaginatedResponse<Payment>> {
    const [data, total] = await this.paymentRepository.findAndCount({
      relations: ['membership', 'membership.user', 'membership.membershipType', 'registeredBy'],
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

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['membership', 'membership.user', 'membership.membershipType', 'registeredBy'],
    });
    if (!payment) {
      throw new NotFoundException(`Pago con ID "${id}" no encontrado`);
    }
    return payment;
  }

  async findByMembership(membershipId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { membershipId },
      relations: ['registeredBy'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.membership', 'membership')
      .innerJoinAndSelect('membership.membershipType', 'membershipType')
      .leftJoinAndSelect('payment.registeredBy', 'registeredBy')
      .where('membership.userId = :userId', { userId })
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();
  }

  async update(id: string, updateDto: UpdatePaymentDto, performedById?: string): Promise<Payment> {
    const payment = await this.findOne(id);

    // Si se cambia la membresía, verificar que existe
    if (updateDto.membershipId && updateDto.membershipId !== payment.membershipId) {
      const membership = await this.membershipRepository.findOne({
        where: { id: updateDto.membershipId },
      });
      if (!membership) {
        throw new NotFoundException(`Membresía con ID "${updateDto.membershipId}" no encontrada`);
      }
    }

    const previousData = {
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      notes: payment.notes,
    };

    Object.assign(payment, updateDto);
    if (updateDto.paymentDate) {
      payment.paymentDate = new Date(updateDto.paymentDate);
    }
    if (updateDto.coverageStartDate) {
      payment.coverageStart = new Date(updateDto.coverageStartDate);
    }
    if (updateDto.coverageEndDate) {
      payment.coverageEnd = new Date(updateDto.coverageEndDate);
    }

    const updated = await this.paymentRepository.save(payment);

    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: 'Payment',
      entityId: id,
      performedById,
      details: { before: previousData, after: updateDto },
    });

    return updated;
  }

  async remove(id: string, performedById?: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.softRemove(payment);

    await this.auditLogsService.log({
      action: AuditAction.DELETE,
      entity: 'Payment',
      entityId: id,
      performedById,
      details: {
        membershipId: payment.membershipId,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
      },
    });
  }

  // Obtener total recaudado en un período
  async getTotalByPeriod(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.paymentDate >= :startDate', { startDate })
      .andWhere('payment.paymentDate <= :endDate', { endDate })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }

  // Obtener pagos del mes actual
  async getCurrentMonthPayments(): Promise<Payment[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.membership', 'membership')
      .innerJoinAndSelect('membership.user', 'user')
      .where('payment.paymentDate >= :startOfMonth', { startOfMonth })
      .andWhere('payment.paymentDate <= :endOfMonth', { endOfMonth })
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();
  }
}
