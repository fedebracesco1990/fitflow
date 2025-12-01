import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MuscleGroup } from '../../../common/enums/muscle-group.enum';
import { Difficulty } from '../../../common/enums/difficulty.enum';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: MuscleGroup,
    default: MuscleGroup.FULL_BODY,
  })
  muscleGroup: MuscleGroup;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.BEGINNER,
  })
  difficulty: Difficulty;

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
