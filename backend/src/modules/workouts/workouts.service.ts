import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutLog } from './entities/workout-log.entity';
import { ExerciseLog } from './entities/exercise-log.entity';
import { UserProgramRoutine } from '../programs/entities/user-program-routine.entity';
import { UserProgramExercise } from '../programs/entities/user-program-exercise.entity';
import { UpdateWorkoutDto, UpdateExerciseLogDto } from './dto';
import { WorkoutStatus } from '../../common/enums/workout-status.enum';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { PersonalRecordsService } from '../personal-records/personal-records.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeService } from '../websocket/realtime.service';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutLog)
    private readonly workoutLogRepository: Repository<WorkoutLog>,
    @InjectRepository(ExerciseLog)
    private readonly exerciseLogRepository: Repository<ExerciseLog>,
    @InjectRepository(UserProgramRoutine)
    private readonly userProgramRoutineRepository: Repository<UserProgramRoutine>,
    @InjectRepository(UserProgramExercise)
    private readonly userProgramExerciseRepository: Repository<UserProgramExercise>,
    @Inject(forwardRef(() => PersonalRecordsService))
    private readonly personalRecordsService: PersonalRecordsService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly realtimeService: RealtimeService
  ) {}

  async startWorkout(userProgramRoutineId: string, userId: string): Promise<WorkoutLog> {
    const routine = await this.userProgramRoutineRepository.findOne({
      where: { id: userProgramRoutineId },
      relations: ['userProgram', 'exercises', 'exercises.exercise'],
    });

    if (!routine) {
      throw new NotFoundException('Rutina no encontrada');
    }
    if (routine.userProgram.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta rutina');
    }

    const workoutLog = this.workoutLogRepository.create({
      userProgramRoutineId,
      startedAt: new Date(),
      status: WorkoutStatus.IN_PROGRESS,
    });

    const savedWorkout = await this.workoutLogRepository.save(workoutLog);

    for (const exercise of routine.exercises) {
      for (let setNum = 1; setNum <= exercise.sets; setNum++) {
        await this.exerciseLogRepository.save(
          this.exerciseLogRepository.create({
            workoutLogId: savedWorkout.id,
            exerciseId: exercise.exerciseId,
            setNumber: setNum,
            reps: exercise.reps,
            weight: exercise.weight,
            completed: false,
          })
        );
      }
    }

    return this.findOne(savedWorkout.id, userId);
  }

  async findMyHistory(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<WorkoutLog>> {
    const query = this.workoutLogRepository
      .createQueryBuilder('wl')
      .innerJoin('wl.userProgramRoutine', 'upr')
      .innerJoin('upr.userProgram', 'up')
      .where('up.userId = :userId', { userId })
      .andWhere('wl.status = :status', { status: WorkoutStatus.COMPLETED })
      .leftJoinAndSelect('wl.userProgramRoutine', 'routine')
      .leftJoinAndSelect('wl.exerciseLogs', 'exerciseLogs')
      .orderBy('wl.finishedAt', 'DESC');

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
        'userProgramRoutine',
        'userProgramRoutine.userProgram',
        'userProgramRoutine.exercises',
        'userProgramRoutine.exercises.exercise',
        'exerciseLogs',
        'exerciseLogs.exercise',
      ],
    });
    if (!workoutLog) {
      throw new NotFoundException('Workout no encontrado');
    }
    if (workoutLog.userProgramRoutine.userProgram.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este workout');
    }
    return workoutLog;
  }

  async update(id: string, dto: UpdateWorkoutDto, userId: string): Promise<WorkoutLog> {
    const workoutLog = await this.findOne(id, userId);
    Object.assign(workoutLog, dto);
    return await this.workoutLogRepository.save(workoutLog);
  }

  async completeWorkout(id: string, userId: string, duration?: number): Promise<WorkoutLog> {
    const workoutLog = await this.findOne(id, userId);
    workoutLog.status = WorkoutStatus.COMPLETED;
    workoutLog.finishedAt = new Date();
    if (duration) {
      workoutLog.duration = duration;
    }

    const savedWorkout = await this.workoutLogRepository.save(workoutLog);

    await this.userProgramRoutineRepository.update(workoutLog.userProgramRoutineId, {
      lastCompletedAt: new Date(),
    });

    return savedWorkout;
  }

  async updateExerciseLog(
    workoutId: string,
    logId: string,
    dto: UpdateExerciseLogDto,
    userId: string
  ): Promise<{
    log: ExerciseLog;
    prResult?: { isNewPR: boolean; type: string; exerciseName?: string };
  }> {
    await this.findOne(workoutId, userId);

    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id: logId, workoutLogId: workoutId },
      relations: ['exercise'],
    });
    if (!exerciseLog) {
      throw new NotFoundException('Log de ejercicio no encontrado');
    }

    Object.assign(exerciseLog, dto);
    const savedLog = await this.exerciseLogRepository.save(exerciseLog);

    let prResult: { isNewPR: boolean; type: string; exerciseName?: string } | undefined;

    if (dto.completed && dto.weight && dto.reps && dto.reps > 0) {
      const result = await this.personalRecordsService.checkAndUpdatePR(
        userId,
        exerciseLog.exerciseId,
        dto.weight,
        dto.reps
      );

      if (result.isNewPR) {
        prResult = {
          isNewPR: true,
          type: result.type || 'weight',
          exerciseName: result.exerciseName,
        };

        await this.notificationsService.sendToUser(
          userId,
          'Nuevo Récord Personal',
          `Nuevo PR en ${result.exerciseName}: ${dto.weight}kg x ${dto.reps} reps`
        );
      }
    }

    return { log: savedLog, prResult };
  }

  async getExerciseLogs(workoutId: string, userId: string): Promise<ExerciseLog[]> {
    await this.findOne(workoutId, userId);

    return await this.exerciseLogRepository.find({
      where: { workoutLogId: workoutId },
      relations: ['exercise'],
      order: { exerciseId: 'ASC', setNumber: 'ASC' },
    });
  }

  async deleteExerciseLog(workoutId: string, logId: string, userId: string): Promise<void> {
    await this.findOne(workoutId, userId);

    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id: logId, workoutLogId: workoutId },
    });
    if (!exerciseLog) {
      throw new NotFoundException('Log de ejercicio no encontrado');
    }

    await this.exerciseLogRepository.remove(exerciseLog);
  }

  async getLastWorkoutForRoutine(
    userProgramRoutineId: string,
    userId: string
  ): Promise<WorkoutLog | null> {
    const routine = await this.userProgramRoutineRepository.findOne({
      where: { id: userProgramRoutineId },
      relations: ['userProgram'],
    });

    if (!routine || routine.userProgram.userId !== userId) {
      return null;
    }

    return this.workoutLogRepository.findOne({
      where: {
        userProgramRoutineId,
        status: WorkoutStatus.COMPLETED,
      },
      relations: ['exerciseLogs', 'exerciseLogs.exercise'],
      order: { finishedAt: 'DESC' },
    });
  }
}
