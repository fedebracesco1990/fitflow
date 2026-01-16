import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from './entities/routine.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  AddExerciseDto,
  UpdateRoutineExerciseDto,
} from './dto';
import { Role } from '../../common/enums/role.enum';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { RealtimeService } from '../websocket/realtime.service';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    private readonly realtimeService: RealtimeService
  ) {}

  async create(createDto: CreateRoutineDto, userId: string): Promise<Routine> {
    const routine = this.routineRepository.create({
      ...createDto,
      createdById: userId,
    });
    return await this.routineRepository.save(routine);
  }

  async findAll(
    includeInactive = false,
    page = 1,
    limit = 20,
    createdBy?: string
  ): Promise<PaginatedResponse<Routine>> {
    const where: Record<string, unknown> = includeInactive ? {} : { isActive: true };

    if (createdBy) {
      where.createdById = createdBy;
    }

    const [data, total] = await this.routineRepository.findAndCount({
      where,
      relations: ['createdBy', 'exercises', 'exercises.exercise'],
      order: { name: 'ASC' },
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

  async findOne(id: string): Promise<Routine> {
    const routine = await this.routineRepository.findOne({
      where: { id },
      relations: ['createdBy', 'exercises', 'exercises.exercise'],
    });
    if (!routine) {
      throw new NotFoundException(`Rutina con ID "${id}" no encontrada`);
    }
    // Ordenar ejercicios por order
    if (routine.exercises) {
      routine.exercises.sort((a, b) => a.order - b.order);
    }
    return routine;
  }

  async update(
    id: string,
    updateDto: UpdateRoutineDto,
    userId: string,
    userRole: Role
  ): Promise<Routine> {
    const routine = await this.findOne(id);

    // Solo ADMIN o el creador puede editar
    if (userRole !== Role.ADMIN && routine.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para editar esta rutina');
    }

    Object.assign(routine, updateDto);
    const savedRoutine = await this.routineRepository.save(routine);

    this.notifyRoutineUpdated(savedRoutine, userId);

    return savedRoutine;
  }

  async remove(id: string): Promise<void> {
    const routine = await this.findOne(id);
    await this.routineRepository.remove(routine);
  }

  // Ejercicios de rutina
  async addExercise(
    routineId: string,
    dto: AddExerciseDto,
    userId: string,
    userRole: Role
  ): Promise<RoutineExercise> {
    const routine = await this.findOne(routineId);

    // Verificar permisos
    if (userRole !== Role.ADMIN && routine.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta rutina');
    }

    // Verificar que el ejercicio existe
    const exercise = await this.exerciseRepository.findOne({
      where: { id: dto.exerciseId, isActive: true },
    });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID "${dto.exerciseId}" no encontrado`);
    }

    // Verificar si ya existe
    const existing = await this.routineExerciseRepository.findOne({
      where: { routineId, exerciseId: dto.exerciseId },
    });
    if (existing) {
      throw new ConflictException('Este ejercicio ya está en la rutina');
    }

    // Calcular orden si no se proporciona
    let order = dto.order;
    if (!order) {
      const maxOrder = await this.routineExerciseRepository
        .createQueryBuilder('re')
        .select('MAX(re.order)', 'max')
        .where('re.routineId = :routineId', { routineId })
        .getRawOne<{ max: number }>();
      order = (maxOrder?.max || 0) + 1;
    }

    const routineExercise = this.routineExerciseRepository.create({
      routineId,
      exerciseId: dto.exerciseId,
      order,
      sets: dto.sets || 3,
      reps: dto.reps || 12,
      restSeconds: dto.restSeconds || 60,
      notes: dto.notes,
      suggestedWeight: dto.suggestedWeight,
      dayOfWeek: dto.dayOfWeek,
    });

    return await this.routineExerciseRepository.save(routineExercise);
  }

  async updateExercise(
    routineId: string,
    routineExerciseId: string,
    dto: UpdateRoutineExerciseDto,
    userId: string,
    userRole: Role
  ): Promise<RoutineExercise> {
    const routine = await this.findOne(routineId);

    if (userRole !== Role.ADMIN && routine.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta rutina');
    }

    const routineExercise = await this.routineExerciseRepository.findOne({
      where: { id: routineExerciseId, routineId },
    });
    if (!routineExercise) {
      throw new NotFoundException('Ejercicio no encontrado en la rutina');
    }

    Object.assign(routineExercise, dto);
    return await this.routineExerciseRepository.save(routineExercise);
  }

  async removeExercise(
    routineId: string,
    routineExerciseId: string,
    userId: string,
    userRole: Role
  ): Promise<void> {
    const routine = await this.findOne(routineId);

    if (userRole !== Role.ADMIN && routine.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta rutina');
    }

    const routineExercise = await this.routineExerciseRepository.findOne({
      where: { id: routineExerciseId, routineId },
    });
    if (!routineExercise) {
      throw new NotFoundException('Ejercicio no encontrado en la rutina');
    }

    await this.routineExerciseRepository.remove(routineExercise);
  }

  private notifyRoutineUpdated(routine: Routine, updatedBy: string): void {
    if (!routine.createdById) return;

    this.realtimeService.notifyRoutineUpdate(routine.createdById, {
      routineId: routine.id,
      routineName: routine.name,
      updatedBy,
      updatedAt: new Date(),
    });
  }
}
