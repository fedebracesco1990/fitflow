import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuscleGroup } from './entities/muscle-group.entity';

@Injectable()
export class MuscleGroupsService {
  constructor(
    @InjectRepository(MuscleGroup)
    private readonly muscleGroupRepository: Repository<MuscleGroup>
  ) {}

  async findAll(includeInactive = false): Promise<MuscleGroup[]> {
    const where = includeInactive ? {} : { isActive: true };
    return await this.muscleGroupRepository.find({
      where,
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MuscleGroup> {
    const muscleGroup = await this.muscleGroupRepository.findOne({
      where: { id },
    });
    if (!muscleGroup) {
      throw new NotFoundException(`Grupo muscular con ID "${id}" no encontrado`);
    }
    return muscleGroup;
  }

  async findByCode(code: string): Promise<MuscleGroup> {
    const muscleGroup = await this.muscleGroupRepository.findOne({
      where: { code },
    });
    if (!muscleGroup) {
      throw new NotFoundException(`Grupo muscular con código "${code}" no encontrado`);
    }
    return muscleGroup;
  }

  async create(data: Partial<MuscleGroup>): Promise<MuscleGroup> {
    const existing = await this.muscleGroupRepository.findOne({
      where: { code: data.code },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un grupo muscular con el código "${data.code}"`);
    }
    const muscleGroup = this.muscleGroupRepository.create(data);
    return await this.muscleGroupRepository.save(muscleGroup);
  }

  async update(id: string, data: Partial<MuscleGroup>): Promise<MuscleGroup> {
    const muscleGroup = await this.findOne(id);
    Object.assign(muscleGroup, data);
    return await this.muscleGroupRepository.save(muscleGroup);
  }

  async seed(): Promise<void> {
    const seedData = [
      { code: 'chest', name: 'Pecho', icon: '💪', order: 1 },
      { code: 'back', name: 'Espalda', icon: '🔙', order: 2 },
      { code: 'shoulders', name: 'Hombros', icon: '🦾', order: 3 },
      { code: 'biceps', name: 'Bíceps', icon: '💪', order: 4 },
      { code: 'triceps', name: 'Tríceps', icon: '💪', order: 5 },
      { code: 'legs', name: 'Piernas', icon: '🦵', order: 6 },
      { code: 'glutes', name: 'Glúteos', icon: '🍑', order: 7 },
      { code: 'core', name: 'Core', icon: '🎯', order: 8 },
      { code: 'cardio', name: 'Cardio', icon: '❤️', order: 9 },
      { code: 'full_body', name: 'Cuerpo Completo', icon: '🏋️', order: 10 },
    ];

    for (const data of seedData) {
      const existing = await this.muscleGroupRepository.findOne({
        where: { code: data.code },
      });
      if (!existing) {
        await this.muscleGroupRepository.save(this.muscleGroupRepository.create(data));
      }
    }
  }
}
