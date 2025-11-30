import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  resetPasswordTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  async beforeInsert() {
    if (this.password) {
      this.email = this.email.toLowerCase();
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeUpdate()
  async beforeUpdate() {
    if (this.password && this.password !== this.tempPassword) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  toJSON() {
    return {
      ...this,
      password: undefined,
      refreshToken: undefined,
      resetPasswordTokenHash: undefined,
      resetPasswordExpires: undefined,
      tempPassword: undefined,
    };
  }
}
