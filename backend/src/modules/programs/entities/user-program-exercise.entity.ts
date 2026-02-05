import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserProgramRoutine } from './user-program-routine.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('user_program_exercises')
export class UserProgramExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userProgramRoutineId: string;

  @ManyToOne(() => UserProgramRoutine, (upr) => upr.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userProgramRoutineId' })
  userProgramRoutine: UserProgramRoutine;

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

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
