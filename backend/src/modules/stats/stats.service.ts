import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseLog } from '../workouts/entities/exercise-log.entity';
import { WorkoutLog } from '../workouts/entities/workout-log.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { PersonalRecord } from '../personal-records/entities/personal-record.entity';
import { WorkoutStatus } from '../../common/enums/workout-status.enum';
import {
  ExerciseProgressDto,
  ExerciseProgressPointDto,
  VolumeStatsDto,
  VolumeDataPointDto,
  MonthlyComparisonDto,
} from './dto';

interface RawProgressResult {
  date: string;
  maxWeight: string;
  maxVolume: string;
  totalSets: string;
  avgReps: string;
}

interface RawVolumeResult {
  date: string;
  volume: string;
  workoutCount: string;
}

interface RawMuscleGroupVolumeResult {
  muscleGroupId: string | null;
  muscleGroupName: string;
  volume: string;
}

interface RawMonthlyResult {
  totalWorkouts: string;
  totalVolume: string;
  totalSets: string;
  avgDuration: string;
  uniqueExercises: string;
}

@Injectable()
export class StatsService {
  private readonly DEFAULT_DAYS = 90;
  private readonly STAGNANT_WEEKS_THRESHOLD = 3;

  constructor(
    @InjectRepository(ExerciseLog)
    private readonly exerciseLogRepository: Repository<ExerciseLog>,
    @InjectRepository(WorkoutLog)
    private readonly workoutLogRepository: Repository<WorkoutLog>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(PersonalRecord)
    private readonly personalRecordRepository: Repository<PersonalRecord>
  ) {}

  async getExerciseProgress(
    userId: string,
    exerciseId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ExerciseProgressDto> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException('Ejercicio no encontrado');
    }

    const { start, end } = this.getDateRange(startDate, endDate);

    const rawData = await this.exerciseLogRepository
      .createQueryBuilder('el')
      .innerJoin('el.workoutLog', 'wl')
      .innerJoin('wl.userRoutine', 'ur')
      .innerJoin('el.routineExercise', 're')
      .where('ur.userId = :userId', { userId })
      .andWhere('re.exerciseId = :exerciseId', { exerciseId })
      .andWhere('wl.status = :status', { status: WorkoutStatus.COMPLETED })
      .andWhere('wl.date BETWEEN :start AND :end', { start, end })
      .andWhere('el.completed = :completed', { completed: true })
      .select('DATE(wl.date)', 'date')
      .addSelect('MAX(el.weight)', 'maxWeight')
      .addSelect('MAX(el.weight * el.reps)', 'maxVolume')
      .addSelect('COUNT(el.id)', 'totalSets')
      .addSelect('AVG(el.reps)', 'avgReps')
      .groupBy('DATE(wl.date)')
      .orderBy('date', 'ASC')
      .getRawMany<RawProgressResult>();

    const dataPoints: ExerciseProgressPointDto[] = rawData.map((r) => ({
      date: r.date,
      maxWeight: parseFloat(r.maxWeight) || 0,
      maxVolume: parseFloat(r.maxVolume) || 0,
      totalSets: parseInt(r.totalSets, 10) || 0,
      avgReps: parseFloat(r.avgReps) || 0,
    }));

    const summary = this.calculateProgressSummary(dataPoints);

    return {
      exerciseId,
      exerciseName: exercise.name,
      dataPoints,
      summary,
    };
  }

  async getVolumeStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<VolumeStatsDto> {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [volumeByDate, volumeByMuscle] = await Promise.all([
      this.getVolumeByDate(userId, start, end),
      this.getVolumeByMuscleGroup(userId, start, end),
    ]);

    const totalVolume = volumeByDate.reduce((sum, d) => sum + d.volume, 0);
    const totalWorkouts = volumeByDate.reduce((sum, d) => sum + d.workoutCount, 0);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    const totalMuscleVolume = volumeByMuscle.reduce((sum, m) => sum + m.volume, 0);
    const byMuscleGroup = volumeByMuscle.map((m) => ({
      ...m,
      percentage: totalMuscleVolume > 0 ? Math.round((m.volume / totalMuscleVolume) * 100) : 0,
    }));

    return {
      totalVolume: Math.round(totalVolume),
      avgVolumePerWorkout: totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0,
      avgVolumePerDay: Math.round(totalVolume / daysDiff),
      dataPoints: volumeByDate,
      byMuscleGroup,
    };
  }

  async getMonthlyComparison(userId: string): Promise<MonthlyComparisonDto> {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [currentStats, previousStats, currentPRs, previousPRs] = await Promise.all([
      this.getMonthStats(userId, currentMonthStart, currentMonthEnd),
      this.getMonthStats(userId, previousMonthStart, previousMonthEnd),
      this.countPRsInPeriod(userId, currentMonthStart, currentMonthEnd),
      this.countPRsInPeriod(userId, previousMonthStart, previousMonthEnd),
    ]);

    const currentMonth = { ...currentStats, personalRecords: currentPRs };
    const previousMonth = { ...previousStats, personalRecords: previousPRs };

    const changes = {
      workoutsChange: currentMonth.totalWorkouts - previousMonth.totalWorkouts,
      workoutsChangePercent: this.calcPercentChange(
        previousMonth.totalWorkouts,
        currentMonth.totalWorkouts
      ),
      volumeChange: currentMonth.totalVolume - previousMonth.totalVolume,
      volumeChangePercent: this.calcPercentChange(
        previousMonth.totalVolume,
        currentMonth.totalVolume
      ),
      setsChange: currentMonth.totalSets - previousMonth.totalSets,
      setsChangePercent: this.calcPercentChange(previousMonth.totalSets, currentMonth.totalSets),
    };

    return { currentMonth, previousMonth, changes };
  }

  private getDateRange(startDate?: string, endDate?: string): { start: Date; end: Date } {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - this.DEFAULT_DAYS * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  private calculateProgressSummary(dataPoints: ExerciseProgressPointDto[]) {
    if (dataPoints.length === 0) {
      return {
        startWeight: null,
        currentWeight: null,
        weightChange: 0,
        weightChangePercent: 0,
        totalWorkouts: 0,
        isStagnant: false,
        stagnantWeeks: 0,
      };
    }

    const startWeight = dataPoints[0].maxWeight;
    const currentWeight = dataPoints[dataPoints.length - 1].maxWeight;
    const weightChange = currentWeight - startWeight;
    const weightChangePercent = startWeight > 0 ? (weightChange / startWeight) * 100 : 0;

    const { isStagnant, stagnantWeeks } = this.detectStagnation(dataPoints);

    return {
      startWeight,
      currentWeight,
      weightChange: Math.round(weightChange * 100) / 100,
      weightChangePercent: Math.round(weightChangePercent * 100) / 100,
      totalWorkouts: dataPoints.length,
      isStagnant,
      stagnantWeeks,
    };
  }

  private detectStagnation(dataPoints: ExerciseProgressPointDto[]): {
    isStagnant: boolean;
    stagnantWeeks: number;
  } {
    if (dataPoints.length < 2) {
      return { isStagnant: false, stagnantWeeks: 0 };
    }

    const recentPoints = dataPoints.slice(-this.STAGNANT_WEEKS_THRESHOLD * 2);
    if (recentPoints.length < 2) {
      return { isStagnant: false, stagnantWeeks: 0 };
    }

    const maxWeightInPeriod = Math.max(...recentPoints.map((p) => p.maxWeight));
    const firstMaxWeight = recentPoints[0].maxWeight;

    const isStagnant = maxWeightInPeriod <= firstMaxWeight && recentPoints.length >= 4;

    let stagnantWeeks = 0;
    if (isStagnant) {
      const firstDate = new Date(recentPoints[0].date);
      const lastDate = new Date(recentPoints[recentPoints.length - 1].date);
      stagnantWeeks = Math.floor(
        (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
    }

    return { isStagnant, stagnantWeeks };
  }

  private async getVolumeByDate(
    userId: string,
    start: Date,
    end: Date
  ): Promise<VolumeDataPointDto[]> {
    const rawData = await this.exerciseLogRepository
      .createQueryBuilder('el')
      .innerJoin('el.workoutLog', 'wl')
      .innerJoin('wl.userRoutine', 'ur')
      .where('ur.userId = :userId', { userId })
      .andWhere('wl.status = :status', { status: WorkoutStatus.COMPLETED })
      .andWhere('wl.date BETWEEN :start AND :end', { start, end })
      .andWhere('el.completed = :completed', { completed: true })
      .select('DATE(wl.date)', 'date')
      .addSelect('SUM(el.weight * el.reps)', 'volume')
      .addSelect('COUNT(DISTINCT wl.id)', 'workoutCount')
      .groupBy('DATE(wl.date)')
      .orderBy('date', 'ASC')
      .getRawMany<RawVolumeResult>();

    return rawData.map((r) => ({
      date: r.date,
      volume: Math.round(parseFloat(r.volume) || 0),
      workoutCount: parseInt(r.workoutCount, 10) || 0,
    }));
  }

  private async getVolumeByMuscleGroup(
    userId: string,
    start: Date,
    end: Date
  ): Promise<{ muscleGroupId: string | null; muscleGroupName: string; volume: number }[]> {
    const rawData = await this.exerciseLogRepository
      .createQueryBuilder('el')
      .innerJoin('el.workoutLog', 'wl')
      .innerJoin('wl.userRoutine', 'ur')
      .innerJoin('el.routineExercise', 're')
      .innerJoin('re.exercise', 'ex')
      .leftJoin('ex.muscleGroup', 'mg')
      .where('ur.userId = :userId', { userId })
      .andWhere('wl.status = :status', { status: WorkoutStatus.COMPLETED })
      .andWhere('wl.date BETWEEN :start AND :end', { start, end })
      .andWhere('el.completed = :completed', { completed: true })
      .select('ex.muscleGroupId', 'muscleGroupId')
      .addSelect('COALESCE(mg.name, :unknown)', 'muscleGroupName')
      .addSelect('SUM(el.weight * el.reps)', 'volume')
      .setParameter('unknown', 'Sin grupo')
      .groupBy('ex.muscleGroupId')
      .addGroupBy('mg.name')
      .orderBy('volume', 'DESC')
      .getRawMany<RawMuscleGroupVolumeResult>();

    return rawData.map((r) => ({
      muscleGroupId: r.muscleGroupId,
      muscleGroupName: r.muscleGroupName,
      volume: Math.round(parseFloat(r.volume) || 0),
    }));
  }

  private async getMonthStats(
    userId: string,
    start: Date,
    end: Date
  ): Promise<{
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    avgWorkoutDuration: number;
    uniqueExercises: number;
  }> {
    const result = await this.workoutLogRepository
      .createQueryBuilder('wl')
      .innerJoin('wl.userRoutine', 'ur')
      .leftJoin('wl.exerciseLogs', 'el')
      .leftJoin('el.routineExercise', 're')
      .where('ur.userId = :userId', { userId })
      .andWhere('wl.status = :status', { status: WorkoutStatus.COMPLETED })
      .andWhere('wl.date BETWEEN :start AND :end', { start, end })
      .select('COUNT(DISTINCT wl.id)', 'totalWorkouts')
      .addSelect('COALESCE(SUM(el.weight * el.reps), 0)', 'totalVolume')
      .addSelect('COUNT(el.id)', 'totalSets')
      .addSelect('AVG(wl.duration)', 'avgDuration')
      .addSelect('COUNT(DISTINCT re.exerciseId)', 'uniqueExercises')
      .getRawOne<RawMonthlyResult>();

    return {
      totalWorkouts: parseInt(result?.totalWorkouts || '0', 10),
      totalVolume: Math.round(parseFloat(result?.totalVolume || '0')),
      totalSets: parseInt(result?.totalSets || '0', 10),
      avgWorkoutDuration: Math.round(parseFloat(result?.avgDuration || '0')),
      uniqueExercises: parseInt(result?.uniqueExercises || '0', 10),
    };
  }

  private async countPRsInPeriod(userId: string, start: Date, end: Date): Promise<number> {
    const count = await this.personalRecordRepository
      .createQueryBuilder('pr')
      .where('pr.userId = :userId', { userId })
      .andWhere(
        '(pr.maxWeightAchievedAt BETWEEN :start AND :end OR pr.maxVolumeAchievedAt BETWEEN :start AND :end)',
        { start, end }
      )
      .getCount();

    return count;
  }

  private calcPercentChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }
}
