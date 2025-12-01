import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkoutLog } from './workout-log.entity';
import { RoutineExercise } from '../../routines/entities/routine-exercise.entity';

@Entity('exercise_logs')
export class ExerciseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workoutLogId: string;

  @ManyToOne(() => WorkoutLog, (wl) => wl.exerciseLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workoutLogId' })
  workoutLog: WorkoutLog;

  @Column({ type: 'uuid' })
  routineExerciseId: string;

  @ManyToOne(() => RoutineExercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routineExerciseId' })
  routineExercise: RoutineExercise;

  @Column({ type: 'int' })
  setNumber: number;

  @Column({ type: 'int' })
  reps: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight: number | null; // kg

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
