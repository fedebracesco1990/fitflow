import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccessType } from '../../../common/enums/access-type.enum';

@Entity('membership_types')
export class MembershipType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', comment: 'Duración en días' })
  durationDays: number;

  @Column({ type: 'int', default: 0, comment: 'Días de gracia después del vencimiento' })
  gracePeriodDays: number;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.ALL_ACCESS,
    comment: 'Tipo de acceso que otorga la membresía',
  })
  accessType: AccessType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
