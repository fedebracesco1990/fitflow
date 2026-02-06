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

export enum NotificationTargetType {
  USER = 'user',
  BROADCAST = 'broadcast',
}

@Entity('notifications')
@Index(['targetUserId', 'createdAt'])
@Index(['targetType', 'createdAt'])
export class AppNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 1000 })
  body: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string | null;

  @Column({
    type: 'enum',
    enum: NotificationTargetType,
    default: NotificationTargetType.USER,
  })
  targetType: NotificationTargetType;

  @Column({ type: 'varchar', length: 36, nullable: true })
  targetUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true })
  senderUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'senderUserId' })
  senderUser: User;

  @Column({ type: 'json', nullable: true })
  data: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
