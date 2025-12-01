import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>
  ) {}

  async create(createDto: CreatePaymentDto, registeredById: string): Promise<Payment> {
    // Verificar que la membresía existe
    const membership = await this.membershipRepository.findOne({
      where: { id: createDto.membershipId },
    });
    if (!membership) {
      throw new NotFoundException(`Membresía con ID "${createDto.membershipId}" no encontrada`);
    }

    const payment = this.paymentRepository.create({
      ...createDto,
      paymentDate: new Date(createDto.paymentDate),
      registeredById,
    });

    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      relations: ['membership', 'membership.user', 'membership.membershipType', 'registeredBy'],
      order: { createdAt: 'DESC' },
    });
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
