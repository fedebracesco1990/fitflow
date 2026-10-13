import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD when the database has
 * no admin yet. Needed in production, where the seeder (with its test users) does not run.
 * Once an admin exists it does nothing, so the variables can stay set or be removed.
 */
@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      return;
    }

    const adminCount = await this.usersRepository.count({ where: { role: Role.ADMIN } });
    if (adminCount > 0) {
      return;
    }

    const admin = this.usersRepository.create({
      name: this.configService.get<string>('ADMIN_NAME') || 'Administrador',
      email: email.toLowerCase(),
      password,
      role: Role.ADMIN,
    });
    await this.usersRepository.save(admin);
    this.logger.log(`First administrator created: ${admin.email}`);
  }
}
