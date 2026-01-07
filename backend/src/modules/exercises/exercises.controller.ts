import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto, FilterExercisesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRAINER)
  create(@Body() createDto: CreateExerciseDto) {
    return this.exercisesService.create(createDto);
  }

  @Get()
  findAll(@Query() filters: FilterExercisesDto) {
    return this.exercisesService.findAll(filters);
  }

  @Get('muscle-group/:muscleGroupId')
  findByMuscleGroup(@Param('muscleGroupId', ParseUUIDPipe) muscleGroupId: string) {
    return this.exercisesService.findByMuscleGroup(muscleGroupId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateExerciseDto) {
    return this.exercisesService.update(id, updateDto);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.TRAINER)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.deactivate(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.remove(id);
  }
}
