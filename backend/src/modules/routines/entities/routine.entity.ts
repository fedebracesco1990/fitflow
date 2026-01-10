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
import { TemplateCategory } from '../../../common/enums/template-category.enum';
import { RoutineExercise } from './routine-exercise.entity';

@Entity('routines')
export class Routine {
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

  @Column({ type: 'int', default: 60 })
  estimatedDuration: number; // minutos

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({ type: 'enum', enum: TemplateCategory, nullable: true })
  templateCategory: TemplateCategory | null;

  @OneToMany(() => RoutineExercise, (re) => re.routine, { cascade: true })
  exercises: RoutineExercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
