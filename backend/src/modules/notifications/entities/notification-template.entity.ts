import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationType {
  MEMBERSHIP_EXPIRING = 'MEMBERSHIP_EXPIRING',
  MEMBERSHIP_EXPIRED = 'MEMBERSHIP_EXPIRED',
  LOW_ATTENDANCE = 'LOW_ATTENDANCE',
  CUSTOM = 'CUSTOM',
}

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    unique: true,
  })
  type: NotificationType;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 500 })
  body: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
