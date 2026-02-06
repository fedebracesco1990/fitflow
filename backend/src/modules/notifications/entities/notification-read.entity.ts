import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AppNotification } from './notification.entity';

@Entity('notification_reads')
@Index(['notificationId', 'userId'], { unique: true })
export class NotificationRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  notificationId: string;

  @ManyToOne(() => AppNotification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notificationId' })
  notification: AppNotification;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  readAt: Date;
}
