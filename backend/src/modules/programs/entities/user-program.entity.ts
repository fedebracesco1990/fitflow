import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Program } from './program.entity';
import { UserProgramRoutine } from './user-program-routine.entity';

@Entity('user_programs')
@Index(['userId', 'isActive'])
export class UserProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column({ type: 'varchar', length: 100 })
  programName: string;

  @Column({ type: 'date' })
  assignedAt: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => UserProgramRoutine, (upr) => upr.userProgram, { cascade: true })
  routines: UserProgramRoutine[];

  @CreateDateColumn()
  createdAt: Date;
}
