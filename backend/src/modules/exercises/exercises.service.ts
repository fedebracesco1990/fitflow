import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { CreateExerciseDto, UpdateExerciseDto, FilterExercisesDto } from './dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>
  ) {}

  async create(createDto: CreateExerciseDto): Promise<Exercise> {
    const existing = await this.exerciseRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un ejercicio con el nombre "${createDto.name}"`);
    }

    const exercise = this.exerciseRepository.create(createDto);
    return await this.exerciseRepository.save(exercise);
  }

  async findAll(filters: FilterExercisesDto): Promise<PaginatedResponse<Exercise>> {
    const {
      page = 1,
      limit = 20,
      includeInactive,
      muscleGroupId,
      difficulty,
      equipment,
      search,
    } = filters;

    const queryBuilder = this.exerciseRepository
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.muscleGroup', 'muscleGroup');

    if (includeInactive !== 'true') {
      queryBuilder.andWhere('exercise.isActive = :isActive', { isActive: true });
    }

    if (muscleGroupId) {
      queryBuilder.andWhere('exercise.muscleGroupId = :muscleGroupId', { muscleGroupId });
    }

    if (difficulty) {
      queryBuilder.andWhere('exercise.difficulty = :difficulty', { difficulty });
    }

    if (equipment) {
      queryBuilder.andWhere('exercise.equipment = :equipment', { equipment });
    }

    if (search) {
      queryBuilder.andWhere('(exercise.name LIKE :search OR exercise.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('exercise.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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

  async findByMuscleGroup(muscleGroupId: string): Promise<Exercise[]> {
    return await this.exerciseRepository.find({
      where: { muscleGroupId, isActive: true },
      relations: ['muscleGroup'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: ['muscleGroup'],
    });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID "${id}" no encontrado`);
    }
    return exercise;
  }

  async update(id: string, updateDto: UpdateExerciseDto): Promise<Exercise> {
    const exercise = await this.findOne(id);

    // Verificar nombre único si se está cambiando
    if (updateDto.name && updateDto.name !== exercise.name) {
      const existing = await this.exerciseRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un ejercicio con el nombre "${updateDto.name}"`);
      }
    }

    Object.assign(exercise, updateDto);
    return await this.exerciseRepository.save(exercise);
  }

  async remove(id: string): Promise<void> {
    const exercise = await this.findOne(id);
    await this.exerciseRepository.remove(exercise);
  }

  async deactivate(id: string): Promise<Exercise> {
    const exercise = await this.findOne(id);
    exercise.isActive = false;
    return await this.exerciseRepository.save(exercise);
  }
}
