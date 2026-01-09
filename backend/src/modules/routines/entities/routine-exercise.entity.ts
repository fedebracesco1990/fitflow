import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Routine } from './routine.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

@Entity('routine_exercises')
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  routineId: string;

  @ManyToOne(() => Routine, (routine) => routine.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routineId' })
  routine: Routine;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'int', default: 3 })
  sets: number;

  @Column({ type: 'int', default: 12 })
  reps: number;

  @Column({ type: 'int', default: 60 })
  restSeconds: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  suggestedWeight: number | null;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: true })
  dayOfWeek: DayOfWeek | null;
}
