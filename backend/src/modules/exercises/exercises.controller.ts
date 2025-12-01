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
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreateExerciseDto) {
    return this.exercisesService.create(createDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.exercisesService.findAll(includeInactive === 'true');
  }

  @Get('muscle-group/:muscleGroup')
  findByMuscleGroup(@Param('muscleGroup') muscleGroup: string) {
    return this.exercisesService.findByMuscleGroup(muscleGroup);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateExerciseDto) {
    return this.exercisesService.update(id, updateDto);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.deactivate(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.remove(id);
  }
}
