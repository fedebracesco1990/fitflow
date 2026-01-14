import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DevicePlatform {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}

@Entity('device_tokens')
@Index(['userId', 'token'], { unique: true })
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 500 })
  token: string;

  @Column({
    type: 'enum',
    enum: DevicePlatform,
    default: DevicePlatform.WEB,
  })
  platform: DevicePlatform;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
