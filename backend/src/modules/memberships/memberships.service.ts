import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Membership, MembershipStatus } from './entities/membership.entity';
import { MembershipType } from '../membership-types/entities/membership-type.entity';
import { User } from '../users/entities/user.entity';
import { CreateMembershipDto, UpdateMembershipDto } from './dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(MembershipType)
    private readonly membershipTypeRepository: Repository<MembershipType>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createDto: CreateMembershipDto): Promise<Membership> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${createDto.userId}" no encontrado`);
    }

    // Verificar que el tipo de membresía existe y está activo
    const membershipType = await this.membershipTypeRepository.findOne({
      where: { id: createDto.membershipTypeId, isActive: true },
    });
    if (!membershipType) {
      throw new NotFoundException(
        `Tipo de membresía con ID "${createDto.membershipTypeId}" no encontrado o no está activo`
      );
    }

    // Verificar si el usuario ya tiene una membresía activa
    const existingMembership = await this.membershipRepository.findOne({
      where: {
        userId: createDto.userId,
        status: MembershipStatus.ACTIVE,
      },
    });
    if (existingMembership) {
      throw new BadRequestException('El usuario ya tiene una membresía activa');
    }

    // Calcular fecha de fin si no se proporciona
    const startDate = new Date(createDto.startDate);
    const endDate = createDto.endDate
      ? new Date(createDto.endDate)
      : new Date(startDate.getTime() + membershipType.durationDays * 24 * 60 * 60 * 1000);

    const membership = this.membershipRepository.create({
      ...createDto,
      startDate,
      endDate,
      status: createDto.status || MembershipStatus.ACTIVE,
    });

    return await this.membershipRepository.save(membership);
  }

  async findAll(): Promise<Membership[]> {
    return await this.membershipRepository.find({
      relations: ['user', 'membershipType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ['user', 'membershipType'],
    });
    if (!membership) {
      throw new NotFoundException(`Membresía con ID "${id}" no encontrada`);
    }
    return membership;
  }

  async findByUser(userId: string): Promise<Membership[]> {
    return await this.membershipRepository.find({
      where: { userId },
      relations: ['membershipType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUser(userId: string): Promise<Membership | null> {
    return await this.membershipRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: ['membershipType'],
    });
  }

  async update(id: string, updateDto: UpdateMembershipDto): Promise<Membership> {
    const membership = await this.findOne(id);

    // Si se cambia el tipo de membresía, verificar que existe
    if (updateDto.membershipTypeId && updateDto.membershipTypeId !== membership.membershipTypeId) {
      const membershipType = await this.membershipTypeRepository.findOne({
        where: { id: updateDto.membershipTypeId, isActive: true },
      });
      if (!membershipType) {
        throw new NotFoundException(
          `Tipo de membresía con ID "${updateDto.membershipTypeId}" no encontrado o no está activo`
        );
      }
    }

    Object.assign(membership, updateDto);
    return await this.membershipRepository.save(membership);
  }

  async cancel(id: string): Promise<Membership> {
    const membership = await this.findOne(id);
    membership.status = MembershipStatus.CANCELLED;
    return await this.membershipRepository.save(membership);
  }

  async remove(id: string): Promise<void> {
    const membership = await this.findOne(id);
    await this.membershipRepository.remove(membership);
  }

  // Método para actualizar estados vencidos (puede ejecutarse con un cron job)
  async updateExpiredMemberships(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.membershipRepository
      .createQueryBuilder()
      .update(Membership)
      .set({ status: MembershipStatus.EXPIRED })
      .where('status = :status', { status: MembershipStatus.ACTIVE })
      .andWhere('endDate < :today', { today })
      .execute();

    return result.affected || 0;
  }

  // Obtener membresías próximas a vencer
  async findExpiringMemberships(days: number = 7): Promise<Membership[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return await this.membershipRepository.find({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: LessThanOrEqual(futureDate),
      },
      relations: ['user', 'membershipType'],
      order: { endDate: 'ASC' },
    });
  }
}
