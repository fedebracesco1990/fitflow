import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Difficulty } from '../../../common/enums/difficulty.enum';
import { Equipment } from '../../../common/enums/equipment.enum';
import { MuscleGroup } from '../../muscle-groups/entities/muscle-group.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  muscleGroupId: string | null;

  @ManyToOne(() => MuscleGroup, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'muscleGroupId' })
  muscleGroup: MuscleGroup | null;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.BEGINNER,
  })
  difficulty: Difficulty;

  @Column({
    type: 'enum',
    enum: Equipment,
    default: Equipment.NONE,
  })
  equipment: Equipment;

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
