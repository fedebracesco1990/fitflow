import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuscleGroupsService } from '../../modules/muscle-groups/muscle-groups.service';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly muscleGroupsService: MuscleGroupsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('🌱 Iniciando seed de datos...');

    await this.seedUsers();
    await this.seedMuscleGroups();

    this.logger.log('✅ Seed completado');
  }

  async seedUsers() {
    const usersToSeed = [
      {
        email: 'admin@fitflow.com',
        password: 'Admin123!',
        name: 'Administrador Principal',
        role: Role.ADMIN,
        isActive: true,
      },
      {
        email: 'trainer@fitflow.com',
        password: 'Trainer123!',
        name: 'Carlos Pérez - Entrenador',
        role: Role.TRAINER,
        isActive: true,
      },
      {
        email: 'user1@fitflow.com',
        password: 'User123!',
        name: 'Juan García',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user2@fitflow.com',
        password: 'User123!',
        name: 'María López',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'inactive@fitflow.com',
        password: 'User123!',
        name: 'Usuario Inactivo',
        role: Role.USER,
        isActive: false,
      },
    ];

    for (const userData of usersToSeed) {
      try {
        const existing = await this.userRepository.findOne({
          where: { email: userData.email },
        });

        if (!existing) {
          const user = this.userRepository.create(userData);
          await this.userRepository.save(user);
          const status = userData.isActive ? '' : ' (inactivo)';
          this.logger.log(`  ✓ Usuario creado: ${userData.email} (${userData.role})${status}`);
        } else {
          this.logger.log(`  - Usuario ya existe: ${userData.email}`);
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando usuario ${userData.email}`, error);
      }
    }
  }

  async seedMuscleGroups() {
    try {
      await this.muscleGroupsService.seed();
      this.logger.log('  ✓ Grupos musculares sembrados');
    } catch (error) {
      this.logger.error('  ✗ Error al sembrar grupos musculares', error);
    }
  }
}
