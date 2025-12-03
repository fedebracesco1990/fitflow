import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    private readonly dataSource: DataSource
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
        registeredById,
      });

      const savedPayment = await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

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

  async update(id: string, updateDto: UpdatePaymentDto): Promise<Payment> {
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

    Object.assign(payment, updateDto);
    if (updateDto.paymentDate) {
      payment.paymentDate = new Date(updateDto.paymentDate);
    }

    return await this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
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
