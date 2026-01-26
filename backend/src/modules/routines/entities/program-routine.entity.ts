import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Routine } from './routine.entity';
import { ProgramRoutineExercise } from './program-routine-exercise.entity';

@Entity('program_routines')
@Unique(['programId', 'routineId', 'dayNumber'])
export class ProgramRoutine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => ProgramRoutineExercise, (pre) => pre.programRoutine, { cascade: true })
  customExercises: ProgramRoutineExercise[];

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => Routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programId' })
  program: Routine;

  @Column({ type: 'uuid' })
  routineId: string;

  @ManyToOne(() => Routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routineId' })
  routine: Routine;

  @Column({ type: 'int' })
  dayNumber: number;

  @Column({ type: 'int', default: 1 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
