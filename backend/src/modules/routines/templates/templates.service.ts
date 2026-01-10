import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from '../entities/routine.entity';
import { RoutineExercise } from '../entities/routine-exercise.entity';
import { SaveAsTemplateDto, FilterTemplatesDto, CreateFromTemplateDto } from './dto';
import { Role } from '../../../common/enums/role.enum';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>
  ) {}

  async findAll(query: FilterTemplatesDto): Promise<PaginatedResponse<Routine>> {
    const { page = 1, limit = 20, category } = query;

    const where: Record<string, unknown> = {
      isTemplate: true,
      isActive: true,
    };

    if (category) {
      where.templateCategory = category;
    }

    const [data, total] = await this.routineRepository.findAndCount({
      where,
      relations: ['createdBy', 'exercises', 'exercises.exercise'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async saveAsTemplate(
    routineId: string,
    dto: SaveAsTemplateDto,
    userId: string,
    userRole: Role
  ): Promise<Routine> {
    const routine = await this.routineRepository.findOne({
      where: { id: routineId },
      relations: ['createdBy'],
    });

    if (!routine) {
      throw new NotFoundException(`Rutina con ID "${routineId}" no encontrada`);
    }

    if (userRole !== Role.ADMIN && routine.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para convertir esta rutina en plantilla');
    }

    if (routine.isTemplate) {
      throw new BadRequestException('Esta rutina ya es una plantilla');
    }

    routine.isTemplate = true;
    routine.templateCategory = dto.category;

    if (dto.name) {
      routine.name = dto.name;
    }

    return await this.routineRepository.save(routine);
  }

  async createFromTemplate(
    templateId: string,
    dto: CreateFromTemplateDto,
    userId: string
  ): Promise<Routine> {
    const template = await this.routineRepository.findOne({
      where: { id: templateId, isTemplate: true },
      relations: ['exercises', 'exercises.exercise'],
    });

    if (!template) {
      throw new NotFoundException(`Plantilla con ID "${templateId}" no encontrada`);
    }

    const newRoutine = this.routineRepository.create({
      name: dto.name || `${template.name} (copia)`,
      description: dto.description || template.description,
      difficulty: template.difficulty,
      estimatedDuration: template.estimatedDuration,
      isActive: true,
      isTemplate: false,
      templateCategory: null,
      createdById: userId,
    });

    const savedRoutine = await this.routineRepository.save(newRoutine);

    if (template.exercises && template.exercises.length > 0) {
      const newExercises = template.exercises.map((exercise) =>
        this.routineExerciseRepository.create({
          routineId: savedRoutine.id,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
          suggestedWeight: exercise.suggestedWeight,
          dayOfWeek: exercise.dayOfWeek,
        })
      );

      await this.routineExerciseRepository.save(newExercises);
    }

    const result = await this.routineRepository.findOne({
      where: { id: savedRoutine.id },
      relations: ['createdBy', 'exercises', 'exercises.exercise'],
    });

    return result!;
  }
}
