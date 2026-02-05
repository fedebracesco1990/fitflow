import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Difficulty } from '../../../common/enums/difficulty.enum';
import { ProgramRoutine } from './program-routine.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.BEGINNER,
  })
  difficulty: Difficulty;

  @Column({ type: 'int', default: 0 })
  totalRoutines: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ProgramRoutine, (pr) => pr.program, { cascade: true })
  routines: ProgramRoutine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
