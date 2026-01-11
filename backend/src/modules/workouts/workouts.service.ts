import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutLog } from './entities/workout-log.entity';
import { ExerciseLog } from './entities/exercise-log.entity';
import { UserRoutine } from '../user-routines/entities/user-routine.entity';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';
import {
  CreateWorkoutDto,
  UpdateWorkoutDto,
  LogExerciseDto,
  UpdateExerciseLogDto,
  BulkLogExercisesDto,
} from './dto';
import { WorkoutStatus } from '../../common/enums/workout-status.enum';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutLog)
    private readonly workoutLogRepository: Repository<WorkoutLog>,
    @InjectRepository(ExerciseLog)
    private readonly exerciseLogRepository: Repository<ExerciseLog>,
    @InjectRepository(UserRoutine)
    private readonly userRoutineRepository: Repository<UserRoutine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>
  ) {}

  async create(dto: CreateWorkoutDto, userId: string): Promise<WorkoutLog> {
    // Verificar que la rutina pertenece al usuario
    const userRoutine = await this.userRoutineRepository.findOne({
      where: { id: dto.userRoutineId },
    });
    if (!userRoutine) {
      throw new NotFoundException('Rutina asignada no encontrada');
    }
    if (userRoutine.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta rutina');
    }

    const workoutLog = this.workoutLogRepository.create({
      userRoutineId: dto.userRoutineId,
      date: new Date(dto.date),
      status: WorkoutStatus.PENDING,
      notes: dto.notes,
    });

    return await this.workoutLogRepository.save(workoutLog);
  }

  async findMyHistory(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<WorkoutLog>> {
    const query = this.workoutLogRepository
      .createQueryBuilder('wl')
      .innerJoin('wl.userRoutine', 'ur')
      .where('ur.userId = :userId', { userId })
      .leftJoinAndSelect('wl.userRoutine', 'userRoutine')
      .leftJoinAndSelect('userRoutine.routine', 'routine')
      .leftJoinAndSelect('wl.exerciseLogs', 'exerciseLogs')
      .orderBy('wl.date', 'DESC');

    const total = await query.getCount();

    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

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

  async findOne(id: string, userId: string): Promise<WorkoutLog> {
    const workoutLog = await this.workoutLogRepository.findOne({
      where: { id },
      relations: [
        'userRoutine',
        'userRoutine.routine',
        'userRoutine.routine.exercises',
        'userRoutine.routine.exercises.exercise',
        'exerciseLogs',
        'exerciseLogs.routineExercise',
        'exerciseLogs.routineExercise.exercise',
      ],
    });
    if (!workoutLog) {
      throw new NotFoundException('Workout no encontrado');
    }
    if (workoutLog.userRoutine.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este workout');
    }
    return workoutLog;
  }

  async update(id: string, dto: UpdateWorkoutDto, userId: string): Promise<WorkoutLog> {
    const workoutLog = await this.findOne(id, userId);
    Object.assign(workoutLog, dto);
    return await this.workoutLogRepository.save(workoutLog);
  }

  async startWorkout(id: string, userId: string): Promise<WorkoutLog> {
    const workoutLog = await this.findOne(id, userId);
    workoutLog.status = WorkoutStatus.IN_PROGRESS;
    await this.workoutLogRepository.save(workoutLog);

    // Pre-crear exercise logs para cada ejercicio de la rutina
    const routineExercises = workoutLog.userRoutine.routine.exercises;
    for (const re of routineExercises) {
      // Crear un log para cada serie del ejercicio
      for (let setNum = 1; setNum <= re.sets; setNum++) {
        const existingLog = await this.exerciseLogRepository.findOne({
          where: {
            workoutLogId: id,
            routineExerciseId: re.id,
            setNumber: setNum,
          },
        });

        if (!existingLog) {
          await this.exerciseLogRepository.save(
            this.exerciseLogRepository.create({
              workoutLogId: id,
              routineExerciseId: re.id,
              setNumber: setNum,
              reps: re.reps,
              weight: re.suggestedWeight,
              completed: false,
            })
          );
        }
      }
    }

    // Recargar workout con los nuevos logs
    return await this.findOne(id, userId);
  }

  async completeWorkout(id: string, userId: string, duration?: number): Promise<WorkoutLog> {
    const workoutLog = await this.findOne(id, userId);
    workoutLog.status = WorkoutStatus.COMPLETED;
    if (duration) {
      workoutLog.duration = duration;
    }
    return await this.workoutLogRepository.save(workoutLog);
  }

  // Logs de ejercicios
  async logExercise(workoutId: string, dto: LogExerciseDto, userId: string): Promise<ExerciseLog> {
    const workoutLog = await this.findOne(workoutId, userId);

    // Verificar que el ejercicio pertenece a la rutina
    const routineExercise = await this.routineExerciseRepository.findOne({
      where: {
        id: dto.routineExerciseId,
        routineId: workoutLog.userRoutine.routineId,
      },
    });
    if (!routineExercise) {
      throw new NotFoundException('Ejercicio no encontrado en la rutina');
    }

    const exerciseLog = this.exerciseLogRepository.create({
      workoutLogId: workoutId,
      routineExerciseId: dto.routineExerciseId,
      setNumber: dto.setNumber,
      reps: dto.reps,
      weight: dto.weight ?? null,
      completed: dto.completed ?? true,
      notes: dto.notes,
      rir: dto.rir ?? null,
      rpe: dto.rpe ?? null,
    });

    return await this.exerciseLogRepository.save(exerciseLog);
  }

  async updateExerciseLog(
    workoutId: string,
    logId: string,
    dto: UpdateExerciseLogDto,
    userId: string
  ): Promise<ExerciseLog> {
    await this.findOne(workoutId, userId); // Verifica permisos

    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id: logId, workoutLogId: workoutId },
    });
    if (!exerciseLog) {
      throw new NotFoundException('Log de ejercicio no encontrado');
    }

    Object.assign(exerciseLog, dto);
    return await this.exerciseLogRepository.save(exerciseLog);
  }

  async getExerciseLogs(workoutId: string, userId: string): Promise<ExerciseLog[]> {
    await this.findOne(workoutId, userId); // Verifica permisos

    return await this.exerciseLogRepository.find({
      where: { workoutLogId: workoutId },
      relations: ['routineExercise', 'routineExercise.exercise'],
      order: { routineExerciseId: 'ASC', setNumber: 'ASC' },
    });
  }

  async deleteExerciseLog(workoutId: string, logId: string, userId: string): Promise<void> {
    await this.findOne(workoutId, userId); // Verifica permisos

    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id: logId, workoutLogId: workoutId },
    });
    if (!exerciseLog) {
      throw new NotFoundException('Log de ejercicio no encontrado');
    }

    await this.exerciseLogRepository.remove(exerciseLog);
  }

  async logExercisesBulk(
    workoutId: string,
    dto: BulkLogExercisesDto,
    userId: string
  ): Promise<ExerciseLog[]> {
    const workoutLog = await this.findOne(workoutId, userId);

    const routineExerciseIds = [...new Set(dto.exercises.map((e) => e.routineExerciseId))];
    const routineExercises = await this.routineExerciseRepository.find({
      where: routineExerciseIds.map((id) => ({
        id,
        routineId: workoutLog.userRoutine.routineId,
      })),
    });

    const validIds = new Set(routineExercises.map((re) => re.id));
    const invalidExercises = dto.exercises.filter((e) => !validIds.has(e.routineExerciseId));
    if (invalidExercises.length > 0) {
      throw new NotFoundException(
        `Ejercicios no encontrados en la rutina: ${invalidExercises.map((e) => e.routineExerciseId).join(', ')}`
      );
    }

    const exerciseLogs = dto.exercises.map((item) =>
      this.exerciseLogRepository.create({
        workoutLogId: workoutId,
        routineExerciseId: item.routineExerciseId,
        setNumber: item.setNumber,
        reps: item.reps,
        weight: item.weight ?? null,
        completed: item.completed ?? true,
        notes: item.notes ?? null,
        rir: item.rir ?? null,
        rpe: item.rpe ?? null,
      })
    );

    return await this.exerciseLogRepository.save(exerciseLogs);
  }
}
