import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('personal_records')
@Unique(['userId', 'exerciseId'])
export class PersonalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  maxWeight: number | null;

  @Column({ type: 'int', nullable: true })
  maxWeightReps: number | null;

  @Column({ type: 'timestamp', nullable: true })
  maxWeightAchievedAt: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxVolume: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  maxVolumeWeight: number | null;

  @Column({ type: 'int', nullable: true })
  maxVolumeReps: number | null;

  @Column({ type: 'timestamp', nullable: true })
  maxVolumeAchievedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
