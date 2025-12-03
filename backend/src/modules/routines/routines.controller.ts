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
  Request,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  AddExerciseDto,
  UpdateRoutineExerciseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationWithFilterDto } from '../../common/dto';

@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRAINER)
  create(@Body() createDto: CreateRoutineDto, @Request() req: { user: AuthenticatedUser }) {
    return this.routinesService.create(createDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: PaginationWithFilterDto) {
    return this.routinesService.findAll(query.includeInactive === 'true', query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRoutineDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.update(id, updateDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.remove(id);
  }

  // Ejercicios de rutina
  @Post(':id/exercises')
  @Roles(Role.ADMIN, Role.TRAINER)
  addExercise(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddExerciseDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.addExercise(id, dto, req.user.userId, req.user.role);
  }

  @Patch(':id/exercises/:exerciseId')
  @Roles(Role.ADMIN, Role.TRAINER)
  updateExercise(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Body() dto: UpdateRoutineExerciseDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.updateExercise(id, exerciseId, dto, req.user.userId, req.user.role);
  }

  @Delete(':id/exercises/:exerciseId')
  @Roles(Role.ADMIN, Role.TRAINER)
  removeExercise(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.removeExercise(id, exerciseId, req.user.userId, req.user.role);
  }
}
