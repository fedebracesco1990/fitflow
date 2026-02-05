import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserProgram } from './user-program.entity';
import { Routine } from '../../routines/entities/routine.entity';
import { UserProgramExercise } from './user-program-exercise.entity';

@Entity('user_program_routines')
export class UserProgramRoutine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userProgramId: string;

  @ManyToOne(() => UserProgram, (up) => up.routines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userProgramId' })
  userProgram: UserProgram;

  @Column({ type: 'uuid', nullable: true })
  originalRoutineId: string | null;

  @ManyToOne(() => Routine, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'originalRoutineId' })
  originalRoutine: Routine | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'int', default: 60 })
  estimatedDuration: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCompletedAt: Date | null;

  @OneToMany(() => UserProgramExercise, (upe) => upe.userProgramRoutine, { cascade: true })
  exercises: UserProgramExercise[];

  @CreateDateColumn()
  createdAt: Date;
}
