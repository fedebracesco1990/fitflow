import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoutine } from './entities/user-routine.entity';
import { User } from '../users/entities/user.entity';
import { Routine } from '../routines/entities/routine.entity';
import {
  AssignRoutineDto,
  UpdateUserRoutineDto,
  BulkAssignRoutineDto,
  BulkAssignResult,
} from './dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UserRoutinesService {
  private readonly logger = new Logger(UserRoutinesService.name);

  constructor(
    @InjectRepository(UserRoutine)
    private readonly userRoutineRepository: Repository<UserRoutine>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    private readonly notificationsService: NotificationsService
  ) {}

  async assign(dto: AssignRoutineDto): Promise<UserRoutine> {
    // Verificar usuario
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${dto.userId}" no encontrado`);
    }

    // Verificar rutina
    const routine = await this.routineRepository.findOne({
      where: { id: dto.routineId, isActive: true },
    });
    if (!routine) {
      throw new NotFoundException(`Rutina con ID "${dto.routineId}" no encontrada`);
    }

    // Verificar que no exista la misma asignación
    const existing = await this.userRoutineRepository.findOne({
      where: {
        userId: dto.userId,
        routineId: dto.routineId,
        dayOfWeek: dto.dayOfWeek,
        isActive: true,
      },
    });
    if (existing) {
      throw new ConflictException('Esta rutina ya está asignada a este usuario en este día');
    }

    const userRoutine = this.userRoutineRepository.create({
      userId: dto.userId,
      routineId: dto.routineId,
      dayOfWeek: dto.dayOfWeek,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });

    return await this.userRoutineRepository.save(userRoutine);
  }

  async findByUser(userId: string): Promise<UserRoutine[]> {
    return await this.userRoutineRepository.find({
      where: { userId, isActive: true },
      relations: ['routine', 'routine.exercises', 'routine.exercises.exercise'],
      order: { dayOfWeek: 'ASC' },
    });
  }

  async getMyWeek(userId: string): Promise<Record<DayOfWeek, UserRoutine[]>> {
    const userRoutines = await this.findByUser(userId);

    const week: Record<DayOfWeek, UserRoutine[]> = {
      [DayOfWeek.MONDAY]: [],
      [DayOfWeek.TUESDAY]: [],
      [DayOfWeek.WEDNESDAY]: [],
      [DayOfWeek.THURSDAY]: [],
      [DayOfWeek.FRIDAY]: [],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    };

    for (const ur of userRoutines) {
      week[ur.dayOfWeek].push(ur);
    }

    return week;
  }

  async findOne(id: string): Promise<UserRoutine> {
    const userRoutine = await this.userRoutineRepository.findOne({
      where: { id },
      relations: ['user', 'routine', 'routine.exercises', 'routine.exercises.exercise'],
    });
    if (!userRoutine) {
      throw new NotFoundException(`Asignación con ID "${id}" no encontrada`);
    }
    return userRoutine;
  }

  async update(id: string, dto: UpdateUserRoutineDto): Promise<UserRoutine> {
    const userRoutine = await this.findOne(id);

    if (dto.startDate) {
      userRoutine.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      userRoutine.endDate = new Date(dto.endDate);
    }
    if (dto.dayOfWeek !== undefined) {
      userRoutine.dayOfWeek = dto.dayOfWeek;
    }
    if (dto.isActive !== undefined) {
      userRoutine.isActive = dto.isActive;
    }

    return await this.userRoutineRepository.save(userRoutine);
  }

  async remove(id: string): Promise<void> {
    const userRoutine = await this.findOne(id);
    await this.userRoutineRepository.remove(userRoutine);
  }

  async deactivate(id: string): Promise<UserRoutine> {
    const userRoutine = await this.findOne(id);
    userRoutine.isActive = false;
    return await this.userRoutineRepository.save(userRoutine);
  }

  async assignBulk(dto: BulkAssignRoutineDto): Promise<BulkAssignResult> {
    const errors: string[] = [];
    let totalAssigned = 0;
    let totalNotifications = 0;

    const routine = await this.routineRepository.findOne({
      where: { id: dto.routineId, isActive: true },
    });
    if (!routine) {
      throw new NotFoundException(`Rutina con ID "${dto.routineId}" no encontrada`);
    }

    const userIds = [...new Set(dto.assignments.map((a) => a.userId))];

    for (const assignment of dto.assignments) {
      try {
        const user = await this.userRepository.findOne({
          where: { id: assignment.userId },
        });
        if (!user) {
          errors.push(`Usuario ${assignment.userId} no encontrado`);
          continue;
        }

        const existing = await this.userRoutineRepository.findOne({
          where: {
            userId: assignment.userId,
            routineId: dto.routineId,
            dayOfWeek: assignment.dayOfWeek,
            isActive: true,
          },
        });
        if (existing) {
          errors.push(`Rutina ya asignada a ${user.name} el ${assignment.dayOfWeek}`);
          continue;
        }

        const userRoutine = this.userRoutineRepository.create({
          userId: assignment.userId,
          routineId: dto.routineId,
          dayOfWeek: assignment.dayOfWeek,
          startDate: new Date(dto.startDate),
        });

        await this.userRoutineRepository.save(userRoutine);
        totalAssigned++;
      } catch (error) {
        this.logger.error(`Error asignando rutina a usuario ${assignment.userId}`, error);
        errors.push(`Error asignando a usuario ${assignment.userId}`);
      }
    }

    for (const userId of userIds) {
      try {
        const result = await this.notificationsService.sendToUser(
          userId,
          '¡Nueva rutina asignada!',
          `Tu entrenador te ha asignado la rutina "${routine.name}". ¡A entrenar!`
        );
        if (result.sent > 0) {
          totalNotifications++;
        }
      } catch (error) {
        this.logger.warn(`No se pudo enviar notificación a usuario ${userId}`, error);
      }
    }

    return {
      success: totalAssigned > 0,
      totalAssigned,
      totalNotifications,
      errors,
    };
  }
}
