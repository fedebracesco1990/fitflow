import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProgramRoutine } from './program-routine.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('program_routine_exercises')
export class ProgramRoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  programRoutineId: string;

  @ManyToOne(() => ProgramRoutine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programRoutineId' })
  programRoutine: ProgramRoutine;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
