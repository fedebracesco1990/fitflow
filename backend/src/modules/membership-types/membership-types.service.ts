import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipType } from './entities/membership-type.entity';
import { CreateMembershipTypeDto, UpdateMembershipTypeDto } from './dto';

@Injectable()
export class MembershipTypesService {
  constructor(
    @InjectRepository(MembershipType)
    private readonly membershipTypeRepository: Repository<MembershipType>
  ) {}

  async create(createDto: CreateMembershipTypeDto): Promise<MembershipType> {
    const existing = await this.membershipTypeRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de membresía con el nombre "${createDto.name}"`
      );
    }

    const membershipType = this.membershipTypeRepository.create(createDto);
    return await this.membershipTypeRepository.save(membershipType);
  }

  async findAll(includeInactive = false): Promise<MembershipType[]> {
    const where = includeInactive ? {} : { isActive: true };
    return await this.membershipTypeRepository.find({
      where,
      order: { price: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MembershipType> {
    const membershipType = await this.membershipTypeRepository.findOne({
      where: { id },
    });

    if (!membershipType) {
      throw new NotFoundException(`Tipo de membresía con ID "${id}" no encontrado`);
    }

    return membershipType;
  }

  async update(id: string, updateDto: UpdateMembershipTypeDto): Promise<MembershipType> {
    const membershipType = await this.findOne(id);

    if (updateDto.name && updateDto.name !== membershipType.name) {
      const existing = await this.membershipTypeRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un tipo de membresía con el nombre "${updateDto.name}"`
        );
      }
    }

    Object.assign(membershipType, updateDto);
    return await this.membershipTypeRepository.save(membershipType);
  }

  async remove(id: string): Promise<void> {
    const membershipType = await this.findOne(id);

    // Soft delete: marcar como inactivo en lugar de eliminar
    membershipType.isActive = false;
    await this.membershipTypeRepository.save(membershipType);
  }

  async hardRemove(id: string): Promise<void> {
    const membershipType = await this.findOne(id);
    await this.membershipTypeRepository.remove(membershipType);
  }
}
