import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Program,
  ProgramRoutine,
  ProgramRoutineExercise,
  UserProgram,
  UserProgramRoutine,
  UserProgramExercise,
} from './entities';
import { Routine } from '../routines/entities/routine.entity';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { AssignProgramDto } from './dto/assign-program.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(ProgramRoutine)
    private readonly programRoutineRepository: Repository<ProgramRoutine>,
    @InjectRepository(ProgramRoutineExercise)
    private readonly programRoutineExerciseRepository: Repository<ProgramRoutineExercise>,
    @InjectRepository(UserProgram)
    private readonly userProgramRepository: Repository<UserProgram>,
    @InjectRepository(UserProgramRoutine)
    private readonly userProgramRoutineRepository: Repository<UserProgramRoutine>,
    @InjectRepository(UserProgramExercise)
    private readonly userProgramExerciseRepository: Repository<UserProgramExercise>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(dto: CreateProgramDto, createdById: string): Promise<Program> {
    const program = this.programRepository.create({
      name: dto.name,
      description: dto.description,
      difficulty: dto.difficulty,
      createdById,
      totalRoutines: dto.routines.length,
    });

    const savedProgram = await this.programRepository.save(program);

    for (const routineDto of dto.routines) {
      const routine = await this.routineRepository.findOne({
        where: { id: routineDto.routineId },
        relations: ['exercises', 'exercises.exercise'],
      });

      if (!routine) {
        throw new NotFoundException(`Routine ${routineDto.routineId} not found`);
      }

      const programRoutine = this.programRoutineRepository.create({
        programId: savedProgram.id,
        routineId: routine.id,
        order: routineDto.order,
      });

      const savedProgramRoutine = await this.programRoutineRepository.save(programRoutine);

      if (routineDto.exercises && routineDto.exercises.length > 0) {
        for (const exerciseDto of routineDto.exercises) {
          const exercise = this.programRoutineExerciseRepository.create({
            programRoutineId: savedProgramRoutine.id,
            exerciseId: exerciseDto.exerciseId,
            order: exerciseDto.order,
            sets: exerciseDto.sets,
            reps: exerciseDto.reps,
            restSeconds: exerciseDto.restSeconds || 60,
            weight: exerciseDto.weight || null,
            notes: exerciseDto.notes || null,
          });
          await this.programRoutineExerciseRepository.save(exercise);
        }
      } else {
        for (const re of routine.exercises) {
          const weight = re.suggestedWeight != null ? parseFloat(String(re.suggestedWeight)) : null;
          const exercise = this.programRoutineExerciseRepository.create({
            programRoutineId: savedProgramRoutine.id,
            exerciseId: re.exerciseId,
            order: re.order,
            sets: re.sets,
            reps: re.reps,
            restSeconds: re.restSeconds,
            weight,
            notes: re.notes,
          });
          await this.programRoutineExerciseRepository.save(exercise);
        }
      }
    }

    return this.findOne(savedProgram.id);
  }

  async findAll(): Promise<Program[]> {
    return this.programRepository.find({
      where: { isActive: true },
      relations: ['routines', 'routines.routine', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: [
        'routines',
        'routines.routine',
        'routines.routine.exercises',
        'routines.exercises',
        'routines.exercises.exercise',
        'createdBy',
      ],
    });

    if (!program) {
      throw new NotFoundException(`Program ${id} not found`);
    }

    return program;
  }

  async update(id: string, dto: CreateProgramDto): Promise<Program> {
    const program = await this.findOne(id);

    // Actualizar datos básicos
    program.name = dto.name;
    program.description = dto.description ?? null;
    program.difficulty = dto.difficulty ?? program.difficulty;
    program.totalRoutines = dto.routines.length;

    await this.programRepository.save(program);

    // Eliminar rutinas existentes
    await this.programRoutineRepository.delete({ programId: id });

    // Crear nuevas rutinas
    for (const routineDto of dto.routines) {
      const routine = await this.routineRepository.findOne({
        where: { id: routineDto.routineId },
        relations: ['exercises', 'exercises.exercise'],
      });

      if (!routine) {
        throw new NotFoundException(`Routine ${routineDto.routineId} not found`);
      }

      const programRoutine = this.programRoutineRepository.create({
        programId: id,
        routineId: routine.id,
        order: routineDto.order,
      });

      const savedProgramRoutine = await this.programRoutineRepository.save(programRoutine);

      // Copiar ejercicios de la rutina original
      for (const re of routine.exercises) {
        const weight = re.suggestedWeight != null ? parseFloat(String(re.suggestedWeight)) : null;
        const exercise = this.programRoutineExerciseRepository.create({
          programRoutineId: savedProgramRoutine.id,
          exerciseId: re.exerciseId,
          order: re.order,
          sets: re.sets,
          reps: re.reps,
          restSeconds: re.restSeconds,
          weight,
          notes: re.notes,
        });
        await this.programRoutineExerciseRepository.save(exercise);
      }
    }

    return this.findOne(id);
  }

  async assignToUser(dto: AssignProgramDto): Promise<UserProgram> {
    const program = await this.findOne(dto.programId);

    await this.userProgramRepository.update(
      { userId: dto.userId, isActive: true },
      { isActive: false, endDate: new Date() }
    );

    const userProgram = this.userProgramRepository.create({
      userId: dto.userId,
      programId: program.id,
      programName: program.name,
      assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : new Date(),
      isActive: true,
    });

    const savedUserProgram = await this.userProgramRepository.save(userProgram);

    for (const pr of program.routines) {
      const userRoutine = this.userProgramRoutineRepository.create({
        userProgramId: savedUserProgram.id,
        originalRoutineId: pr.routineId,
        name: pr.routine.name,
        description: pr.routine.description,
        order: pr.order,
        estimatedDuration: pr.routine.estimatedDuration,
      });

      const savedUserRoutine = await this.userProgramRoutineRepository.save(userRoutine);

      for (const exercise of pr.exercises) {
        const weight = exercise.weight != null ? parseFloat(String(exercise.weight)) : null;
        const userExercise = this.userProgramExerciseRepository.create({
          userProgramRoutineId: savedUserRoutine.id,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          weight,
          notes: exercise.notes,
        });
        await this.userProgramExerciseRepository.save(userExercise);
      }
    }

    const result = await this.findUserProgram(savedUserProgram.id);

    await this.notificationsService.sendToUser(
      dto.userId,
      'Nuevo plan semanal asignado',
      `Se te ha asignado el plan "${program.name}". ¡Revisa tus rutinas!`,
      'program_assigned'
    );

    return result;
  }

  async getActiveByUser(userId: string): Promise<UserProgram | null> {
    return this.userProgramRepository.findOne({
      where: { userId, isActive: true },
      relations: ['routines'],
    });
  }

  async getUserProgramHistory(userId: string): Promise<UserProgram[]> {
    return this.userProgramRepository.find({
      where: { userId },
      relations: [
        'routines',
        'routines.exercises',
        'routines.exercises.exercise',
        'routines.exercises.exercise.muscleGroup',
      ],
      order: { assignedAt: 'DESC' },
    });
  }

  async findUserProgram(id: string): Promise<UserProgram> {
    const userProgram = await this.userProgramRepository.findOne({
      where: { id },
      relations: [
        'routines',
        'routines.exercises',
        'routines.exercises.exercise',
        'routines.exercises.exercise.muscleGroup',
      ],
    });

    if (!userProgram) {
      throw new NotFoundException(`UserProgram ${id} not found`);
    }

    return userProgram;
  }

  async getMyProgram(userId: string): Promise<UserProgram | null> {
    return this.userProgramRepository.findOne({
      where: { userId, isActive: true },
      relations: [
        'routines',
        'routines.exercises',
        'routines.exercises.exercise',
        'routines.exercises.exercise.muscleGroup',
      ],
      order: {
        routines: { order: 'ASC' },
      },
    });
  }

  async getMyRoutine(userId: string, routineId: string): Promise<UserProgramRoutine> {
    const routine = await this.userProgramRoutineRepository.findOne({
      where: {
        id: routineId,
        userProgram: { userId, isActive: true },
      },
      relations: [
        'userProgram',
        'exercises',
        'exercises.exercise',
        'exercises.exercise.muscleGroup',
      ],
    });

    if (!routine) {
      throw new NotFoundException('Routine not found or not assigned to user');
    }

    return routine;
  }

  async updateRoutineLastCompleted(routineId: string): Promise<void> {
    await this.userProgramRoutineRepository.update(routineId, {
      lastCompletedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.programRepository.update(id, { isActive: false });
  }
}
