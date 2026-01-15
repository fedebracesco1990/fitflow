import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoutine } from './entities/user-routine.entity';
import { User } from '../users/entities/user.entity';
import { Routine } from '../routines/entities/routine.entity';
import { WorkoutLog } from '../workouts/entities/workout-log.entity';
import { ExerciseLog } from '../workouts/entities/exercise-log.entity';
import {
  AssignRoutineDto,
  UpdateUserRoutineDto,
  BulkAssignRoutineDto,
  BulkAssignResult,
  TodayRoutineResponse,
  ExerciseWithHistory,
  RoutineHistoryResponseDto,
  RoutineHistoryItemDto,
} from './dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { WorkoutStatus } from '../../common/enums/workout-status.enum';
import { getCurrentDayOfWeek } from '../../common/utils';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UserRoutinesService {
  private readonly logger = new Logger(UserRoutinesService.name);

  constructor(
    @InjectRepository(UserRoutine)
    private readonly userRoutineRepository: Repository<UserRoutine>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(WorkoutLog)
    private readonly workoutLogRepository: Repository<WorkoutLog>,
    @InjectRepository(ExerciseLog)
    private readonly exerciseLogRepository: Repository<ExerciseLog>,
    private readonly notificationsService: NotificationsService
  ) {}

  async assign(dto: AssignRoutineDto): Promise<UserRoutine> {
    // Verificar usuario
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${dto.userId}" no encontrado`);
    }

    // Verificar rutina
    const routine = await this.routineRepository.findOne({
      where: { id: dto.routineId, isActive: true },
    });
    if (!routine) {
      throw new NotFoundException(`Rutina con ID "${dto.routineId}" no encontrada`);
    }

    // Verificar que no exista la misma asignación exacta
    const existingSame = await this.userRoutineRepository.findOne({
      where: {
        userId: dto.userId,
        routineId: dto.routineId,
        dayOfWeek: dto.dayOfWeek,
        isActive: true,
      },
    });
    if (existingSame) {
      throw new ConflictException('Esta rutina ya está asignada a este usuario en este día');
    }

    // Desactivar rutina anterior del mismo día (si existe una diferente)
    const existingOnDay = await this.userRoutineRepository.findOne({
      where: {
        userId: dto.userId,
        dayOfWeek: dto.dayOfWeek,
        isActive: true,
      },
    });
    if (existingOnDay) {
      await this.deactivate(existingOnDay.id);
      this.logger.log(
        `Desactivada rutina anterior ${existingOnDay.id} para usuario ${dto.userId} en ${dto.dayOfWeek}`
      );
    }

    const userRoutine = this.userRoutineRepository.create({
      userId: dto.userId,
      routineId: dto.routineId,
      dayOfWeek: dto.dayOfWeek,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });

    return await this.userRoutineRepository.save(userRoutine);
  }

  async findByUser(userId: string): Promise<UserRoutine[]> {
    return await this.userRoutineRepository.find({
      where: { userId, isActive: true },
      relations: ['routine', 'routine.exercises', 'routine.exercises.exercise'],
      order: { dayOfWeek: 'ASC' },
    });
  }

  async getMyWeek(userId: string): Promise<Record<DayOfWeek, UserRoutine[]>> {
    const userRoutines = await this.findByUser(userId);

    const week: Record<DayOfWeek, UserRoutine[]> = {
      [DayOfWeek.MONDAY]: [],
      [DayOfWeek.TUESDAY]: [],
      [DayOfWeek.WEDNESDAY]: [],
      [DayOfWeek.THURSDAY]: [],
      [DayOfWeek.FRIDAY]: [],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    };

    for (const ur of userRoutines) {
      week[ur.dayOfWeek].push(ur);
    }

    return week;
  }

  async findOne(id: string): Promise<UserRoutine> {
    const userRoutine = await this.userRoutineRepository.findOne({
      where: { id },
      relations: ['user', 'routine', 'routine.exercises', 'routine.exercises.exercise'],
    });
    if (!userRoutine) {
      throw new NotFoundException(`Asignación con ID "${id}" no encontrada`);
    }
    return userRoutine;
  }

  async update(id: string, dto: UpdateUserRoutineDto): Promise<UserRoutine> {
    const userRoutine = await this.findOne(id);

    if (dto.startDate) {
      userRoutine.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      userRoutine.endDate = new Date(dto.endDate);
    }
    if (dto.dayOfWeek !== undefined) {
      userRoutine.dayOfWeek = dto.dayOfWeek;
    }
    if (dto.isActive !== undefined) {
      userRoutine.isActive = dto.isActive;
    }

    return await this.userRoutineRepository.save(userRoutine);
  }

  async remove(id: string): Promise<void> {
    const userRoutine = await this.findOne(id);
    await this.userRoutineRepository.remove(userRoutine);
  }

  async deactivate(id: string): Promise<UserRoutine> {
    const userRoutine = await this.findOne(id);
    userRoutine.isActive = false;
    userRoutine.endDate = new Date();
    return await this.userRoutineRepository.save(userRoutine);
  }

  async assignBulk(dto: BulkAssignRoutineDto): Promise<BulkAssignResult> {
    const errors: string[] = [];
    let totalAssigned = 0;
    let totalNotifications = 0;

    const routine = await this.routineRepository.findOne({
      where: { id: dto.routineId, isActive: true },
    });
    if (!routine) {
      throw new NotFoundException(`Rutina con ID "${dto.routineId}" no encontrada`);
    }

    const userIds = [...new Set(dto.assignments.map((a) => a.userId))];

    for (const assignment of dto.assignments) {
      try {
        const user = await this.userRepository.findOne({
          where: { id: assignment.userId },
        });
        if (!user) {
          errors.push(`Usuario ${assignment.userId} no encontrado`);
          continue;
        }

        const existingSame = await this.userRoutineRepository.findOne({
          where: {
            userId: assignment.userId,
            routineId: dto.routineId,
            dayOfWeek: assignment.dayOfWeek,
            isActive: true,
          },
        });
        if (existingSame) {
          errors.push(`Rutina ya asignada a ${user.name} el ${assignment.dayOfWeek}`);
          continue;
        }

        // Desactivar rutina anterior del mismo día (si existe una diferente)
        const existingOnDay = await this.userRoutineRepository.findOne({
          where: {
            userId: assignment.userId,
            dayOfWeek: assignment.dayOfWeek,
            isActive: true,
          },
        });
        if (existingOnDay) {
          await this.deactivate(existingOnDay.id);
          this.logger.log(
            `Bulk: Desactivada rutina anterior ${existingOnDay.id} para usuario ${assignment.userId} en ${assignment.dayOfWeek}`
          );
        }

        const userRoutine = this.userRoutineRepository.create({
          userId: assignment.userId,
          routineId: dto.routineId,
          dayOfWeek: assignment.dayOfWeek,
          startDate: new Date(dto.startDate),
        });

        await this.userRoutineRepository.save(userRoutine);
        totalAssigned++;
      } catch (error) {
        this.logger.error(`Error asignando rutina a usuario ${assignment.userId}`, error);
        errors.push(`Error asignando a usuario ${assignment.userId}`);
      }
    }

    for (const userId of userIds) {
      try {
        const result = await this.notificationsService.sendToUser(
          userId,
          '¡Nueva rutina asignada!',
          `Tu entrenador te ha asignado la rutina "${routine.name}". ¡A entrenar!`
        );
        if (result.sent > 0) {
          totalNotifications++;
        }
      } catch (error) {
        this.logger.warn(`No se pudo enviar notificación a usuario ${userId}`, error);
      }
    }

    return {
      success: totalAssigned > 0,
      totalAssigned,
      totalNotifications,
      errors,
    };
  }

  async getTodayRoutine(userId: string): Promise<TodayRoutineResponse | null> {
    const currentDayOfWeek = getCurrentDayOfWeek();

    const userRoutine = await this.userRoutineRepository.findOne({
      where: {
        userId,
        dayOfWeek: currentDayOfWeek,
        isActive: true,
      },
      relations: [
        'routine',
        'routine.exercises',
        'routine.exercises.exercise',
        'routine.exercises.exercise.muscleGroup',
      ],
    });

    if (!userRoutine) {
      return null;
    }

    const lastWorkout = await this.workoutLogRepository.findOne({
      where: {
        userRoutineId: userRoutine.id,
        status: WorkoutStatus.COMPLETED,
      },
      order: { date: 'DESC' },
    });

    const exerciseLogsMap: Map<string, ExerciseLog[]> = new Map();

    if (lastWorkout) {
      const exerciseLogs = await this.exerciseLogRepository.find({
        where: { workoutLogId: lastWorkout.id },
        order: { routineExerciseId: 'ASC', setNumber: 'ASC' },
      });

      for (const log of exerciseLogs) {
        if (!exerciseLogsMap.has(log.routineExerciseId)) {
          exerciseLogsMap.set(log.routineExerciseId, []);
        }
        exerciseLogsMap.get(log.routineExerciseId)!.push(log);
      }
    }

    const routineExercises = userRoutine.routine?.exercises || [];
    const exercises: ExerciseWithHistory[] = routineExercises
      .filter((re) => re.exercise) // Filter out any exercises without loaded relation
      .sort((a, b) => a.order - b.order)
      .map((re) => {
        const logs = exerciseLogsMap.get(re.id) || [];
        return {
          id: re.id,
          routineId: re.routineId,
          exerciseId: re.exerciseId,
          exercise: {
            id: re.exercise.id,
            name: re.exercise.name,
            description: re.exercise.description || null,
            muscleGroupId: re.exercise.muscleGroupId || null,
            imageUrl: re.exercise.imageUrl || null,
            videoUrl: re.exercise.videoUrl || null,
          },
          order: re.order,
          sets: re.sets,
          reps: re.reps,
          restSeconds: re.restSeconds,
          notes: re.notes,
          suggestedWeight: re.suggestedWeight,
          dayOfWeek: re.dayOfWeek,
          lastWorkout:
            logs.length > 0
              ? {
                  date: new Date(lastWorkout!.date).toISOString().split('T')[0],
                  sets: logs.map((l) => ({
                    setNumber: l.setNumber,
                    weight: l.weight,
                    reps: l.reps,
                    completed: l.completed,
                  })),
                }
              : null,
        };
      });

    return {
      userRoutine: {
        id: userRoutine.id,
        dayOfWeek: userRoutine.dayOfWeek,
        startDate: userRoutine.startDate,
        isActive: userRoutine.isActive,
      },
      routine: {
        id: userRoutine.routine.id,
        name: userRoutine.routine.name,
        description: userRoutine.routine.description,
        difficulty: userRoutine.routine.difficulty,
        estimatedDuration: userRoutine.routine.estimatedDuration,
      },
      exercises,
      dayOfWeek: currentDayOfWeek,
      hasHistory: lastWorkout !== null,
    };
  }

  async getHistory(userId: string): Promise<RoutineHistoryResponseDto> {
    const inactiveRoutines = await this.userRoutineRepository.find({
      where: { userId, isActive: false },
      relations: ['routine'],
      order: { endDate: 'DESC' },
    });

    const historyItems: RoutineHistoryItemDto[] = [];

    for (const ur of inactiveRoutines) {
      const workoutsCount = await this.workoutLogRepository.count({
        where: {
          userRoutineId: ur.id,
          status: WorkoutStatus.COMPLETED,
        },
      });

      let durationDays: number | null = null;
      if (ur.endDate && ur.startDate) {
        const start = new Date(ur.startDate);
        const end = new Date(ur.endDate);
        durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }

      historyItems.push({
        id: ur.id,
        routineId: ur.routineId,
        routineName: ur.routine?.name || 'Rutina eliminada',
        routineDescription: ur.routine?.description || null,
        dayOfWeek: ur.dayOfWeek,
        startDate: new Date(ur.startDate).toISOString().split('T')[0],
        endDate: ur.endDate ? new Date(ur.endDate).toISOString().split('T')[0] : null,
        durationDays,
        workoutsCompleted: workoutsCount,
      });
    }

    return {
      userId,
      totalRoutines: historyItems.length,
      history: historyItems,
    };
  }

  async getMyHistory(userId: string): Promise<RoutineHistoryResponseDto> {
    return this.getHistory(userId);
  }
}
