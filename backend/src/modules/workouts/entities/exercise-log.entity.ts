import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkoutLog } from './workout-log.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

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
  exerciseId: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

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

  @Column({ type: 'int', nullable: true })
  rir: number | null; // Reps In Reserve (0-5)

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rpe: number | null; // Rate of Perceived Exertion (1-10)
}
