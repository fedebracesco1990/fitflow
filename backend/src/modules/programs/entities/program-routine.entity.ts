import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { Routine } from '../../routines/entities/routine.entity';
import { ProgramRoutineExercise } from './program-routine-exercise.entity';

@Entity('program_routines')
export class ProgramRoutine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, (p) => p.routines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column({ type: 'uuid' })
  routineId: string;

  @ManyToOne(() => Routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routineId' })
  routine: Routine;

  @Column({ type: 'int', default: 1 })
  order: number;

  @OneToMany(() => ProgramRoutineExercise, (pre) => pre.programRoutine, { cascade: true })
  exercises: ProgramRoutineExercise[];

  @CreateDateColumn()
  createdAt: Date;
}
