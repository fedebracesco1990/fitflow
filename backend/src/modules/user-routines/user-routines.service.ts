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

    // Verificar que no exista la misma asignación
    const existing = await this.userRoutineRepository.findOne({
      where: {
        userId: dto.userId,
        routineId: dto.routineId,
        dayOfWeek: dto.dayOfWeek,
        isActive: true,
      },
    });
    if (existing) {
      throw new ConflictException('Esta rutina ya está asignada a este usuario en este día');
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

        const existing = await this.userRoutineRepository.findOne({
          where: {
            userId: assignment.userId,
            routineId: dto.routineId,
            dayOfWeek: assignment.dayOfWeek,
            isActive: true,
          },
        });
        if (existing) {
          errors.push(`Rutina ya asignada a ${user.name} el ${assignment.dayOfWeek}`);
          continue;
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

    const exercises: ExerciseWithHistory[] = userRoutine.routine.exercises
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
            description: re.exercise.description,
            muscleGroupId: re.exercise.muscleGroupId,
            imageUrl: re.exercise.imageUrl,
            videoUrl: re.exercise.videoUrl,
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
                  date: lastWorkout!.date.toISOString().split('T')[0],
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
}
