import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRoutine } from '../../user-routines/entities/user-routine.entity';
import { WorkoutStatus } from '../../../common/enums/workout-status.enum';
import { ExerciseLog } from './exercise-log.entity';

@Entity('workout_logs')
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userRoutineId: string;

  @ManyToOne(() => UserRoutine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userRoutineId' })
  userRoutine: UserRoutine;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: WorkoutStatus,
    default: WorkoutStatus.PENDING,
  })
  status: WorkoutStatus;

  @Column({ type: 'int', nullable: true })
  duration: number | null; // minutos reales

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ExerciseLog, (el) => el.workoutLog, { cascade: true })
  exerciseLogs: ExerciseLog[];

  @CreateDateColumn()
  createdAt: Date;
}
