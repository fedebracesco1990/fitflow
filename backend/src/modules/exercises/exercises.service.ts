import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>
  ) {}

  async create(createDto: CreateExerciseDto): Promise<Exercise> {
    // Verificar nombre único
    const existing = await this.exerciseRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un ejercicio con el nombre "${createDto.name}"`);
    }

    const exercise = this.exerciseRepository.create(createDto);
    return await this.exerciseRepository.save(exercise);
  }

  async findAll(includeInactive = false): Promise<Exercise[]> {
    const where = includeInactive ? {} : { isActive: true };
    return await this.exerciseRepository.find({
      where,
      relations: ['muscleGroup'],
      order: { name: 'ASC' },
    });
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
