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
import { ProgramRoutine } from '../programs/entities/program-routine.entity';
import { ProgramRoutineExercise } from '../programs/entities/program-routine-exercise.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  AddExerciseDto,
  UpdateRoutineExerciseDto,
} from './dto';
import {
  CreateProgramRoutineExerciseDto,
  UpdateProgramRoutineExerciseDto,
} from './dto/program-routine-exercise.dto';
import { RoutineType } from '../../common/enums/routine-type.enum';
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
    @InjectRepository(ProgramRoutine)
    private readonly programRoutineRepository: Repository<ProgramRoutine>,
    @InjectRepository(ProgramRoutineExercise)
    private readonly programRoutineExerciseRepository: Repository<ProgramRoutineExercise>,
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
    createdBy?: string,
    type?: RoutineType
  ): Promise<PaginatedResponse<Routine>> {
    const where: Record<string, unknown> = includeInactive ? {} : { isActive: true };

    if (createdBy) {
      where.createdById = createdBy;
    }

    if (type) {
      where.type = type;
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

  async replaceExercises(
    routineId: string,
    exercises: AddExerciseDto[],
    userId: string,
    userRole: Role
  ): Promise<RoutineExercise[]> {
    const routine = await this.findOne(routineId);

    if (userRole !== Role.ADMIN && routine.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta rutina');
    }

    // Validar que no haya ejercicios duplicados en el array
    const exerciseIds = exercises.map((e) => e.exerciseId);
    const uniqueIds = new Set(exerciseIds);
    if (uniqueIds.size !== exerciseIds.length) {
      throw new ConflictException('No se pueden agregar ejercicios duplicados a la rutina');
    }

    // Eliminar todos los ejercicios existentes
    await this.routineExerciseRepository.delete({ routineId });

    // Agregar los nuevos ejercicios
    const newExercises: RoutineExercise[] = [];
    for (let i = 0; i < exercises.length; i++) {
      const dto = exercises[i];
      const routineExercise = this.routineExerciseRepository.create({
        routineId,
        exerciseId: dto.exerciseId,
        order: dto.order ?? i + 1,
        sets: dto.sets ?? 3,
        reps: dto.reps ?? 12,
        restSeconds: dto.restSeconds ?? 60,
        notes: dto.notes,
        suggestedWeight: dto.suggestedWeight,
        dayOfWeek: dto.dayOfWeek,
      });
      const saved = await this.routineExerciseRepository.save(routineExercise);
      newExercises.push(saved);
    }

    this.notifyRoutineUpdated(routine, userId);
    return newExercises;
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

  // Program Routine Exercises (personalizaciones por instancia)
  async getProgramRoutineWithExercises(programRoutineId: string): Promise<ProgramRoutine> {
    const programRoutine = await this.programRoutineRepository.findOne({
      where: { id: programRoutineId },
      relations: [
        'routine',
        'routine.exercises',
        'routine.exercises.exercise',
        'customExercises',
        'customExercises.exercise',
      ],
    });

    if (!programRoutine) {
      throw new NotFoundException(`ProgramRoutine con ID "${programRoutineId}" no encontrado`);
    }

    return programRoutine;
  }

  async getCustomExercises(programRoutineId: string): Promise<ProgramRoutineExercise[]> {
    return this.programRoutineExerciseRepository.find({
      where: { programRoutineId },
      relations: ['exercise'],
      order: { order: 'ASC' },
    });
  }

  async addCustomExercise(
    programRoutineId: string,
    dto: CreateProgramRoutineExerciseDto,
    userId: string,
    userRole: Role
  ): Promise<ProgramRoutineExercise> {
    const programRoutine = await this.programRoutineRepository.findOne({
      where: { id: programRoutineId },
      relations: ['program'],
    });

    if (!programRoutine) {
      throw new NotFoundException(`ProgramRoutine con ID "${programRoutineId}" no encontrado`);
    }

    if (userRole !== Role.ADMIN && programRoutine.program?.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este programa');
    }

    const exercise = await this.exerciseRepository.findOne({
      where: { id: dto.exerciseId, isActive: true },
    });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID "${dto.exerciseId}" no encontrado`);
    }

    const customExercise = this.programRoutineExerciseRepository.create({
      programRoutineId,
      exerciseId: dto.exerciseId,
      order: dto.order,
      sets: dto.sets,
      reps: dto.reps,
      restSeconds: dto.restSeconds ?? 60,
      notes: dto.notes ?? null,
      weight: dto.weight ?? null,
    });

    return await this.programRoutineExerciseRepository.save(customExercise);
  }

  async updateCustomExercise(
    programRoutineId: string,
    exerciseId: string,
    dto: UpdateProgramRoutineExerciseDto,
    userId: string,
    userRole: Role
  ): Promise<ProgramRoutineExercise> {
    const programRoutine = await this.programRoutineRepository.findOne({
      where: { id: programRoutineId },
      relations: ['program'],
    });

    if (!programRoutine) {
      throw new NotFoundException(`ProgramRoutine con ID "${programRoutineId}" no encontrado`);
    }

    if (userRole !== Role.ADMIN && programRoutine.program?.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este programa');
    }

    const customExercise = await this.programRoutineExerciseRepository.findOne({
      where: { id: exerciseId, programRoutineId },
    });

    if (!customExercise) {
      throw new NotFoundException('Ejercicio personalizado no encontrado');
    }

    Object.assign(customExercise, dto);
    return await this.programRoutineExerciseRepository.save(customExercise);
  }

  async removeCustomExercise(
    programRoutineId: string,
    exerciseId: string,
    userId: string,
    userRole: Role
  ): Promise<void> {
    const programRoutine = await this.programRoutineRepository.findOne({
      where: { id: programRoutineId },
      relations: ['program'],
    });

    if (!programRoutine) {
      throw new NotFoundException(`ProgramRoutine con ID "${programRoutineId}" no encontrado`);
    }

    if (userRole !== Role.ADMIN && programRoutine.program?.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este programa');
    }

    const customExercise = await this.programRoutineExerciseRepository.findOne({
      where: { id: exerciseId, programRoutineId },
    });

    if (!customExercise) {
      throw new NotFoundException('Ejercicio personalizado no encontrado');
    }

    await this.programRoutineExerciseRepository.remove(customExercise);
  }

  async bulkUpdateCustomExercises(
    programRoutineId: string,
    exercises: CreateProgramRoutineExerciseDto[],
    userId: string,
    userRole: Role
  ): Promise<ProgramRoutineExercise[]> {
    const programRoutine = await this.programRoutineRepository.findOne({
      where: { id: programRoutineId },
      relations: ['program'],
    });

    if (!programRoutine) {
      throw new NotFoundException(`ProgramRoutine con ID "${programRoutineId}" no encontrado`);
    }

    if (userRole !== Role.ADMIN && programRoutine.program?.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este programa');
    }

    // Eliminar ejercicios personalizados existentes
    await this.programRoutineExerciseRepository.delete({ programRoutineId });

    // Crear los nuevos
    const customExercises = exercises.map((dto) =>
      this.programRoutineExerciseRepository.create({
        programRoutineId,
        exerciseId: dto.exerciseId,
        order: dto.order,
        sets: dto.sets,
        reps: dto.reps,
        restSeconds: dto.restSeconds ?? 60,
        notes: dto.notes ?? null,
        weight: dto.weight ?? null,
      })
    );

    return await this.programRoutineExerciseRepository.save(customExercises);
  }
}
