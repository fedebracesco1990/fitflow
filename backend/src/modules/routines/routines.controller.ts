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
  FilterRoutinesDto,
  AssignRoutineFromRoutineDto,
  AddRoutineToProgramDto,
} from './dto';
import {
  CreateProgramRoutineExerciseDto,
  UpdateProgramRoutineExerciseDto,
  BulkUpdateProgramRoutineExercisesDto,
} from './dto/program-routine-exercise.dto';
import { RoutineType } from '../../common/enums/routine-type.enum';
import { SaveAsTemplateDto, FilterTemplatesDto, CreateFromTemplateDto } from './templates/dto';
import { TemplatesService } from './templates/templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UserRoutinesService } from '../user-routines/user-routines.service';

@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutinesController {
  constructor(
    private readonly routinesService: RoutinesService,
    private readonly userRoutinesService: UserRoutinesService,
    private readonly templatesService: TemplatesService
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRAINER)
  create(@Body() createDto: CreateRoutineDto, @Request() req: { user: AuthenticatedUser }) {
    return this.routinesService.create(createDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: FilterRoutinesDto) {
    const type = query.type;
    return this.routinesService.findAll(
      query.includeInactive === 'true',
      query.page,
      query.limit,
      query.createdBy,
      type
    );
  }

  @Get('templates')
  @Roles(Role.ADMIN, Role.TRAINER)
  findAllTemplates(@Query() query: FilterTemplatesDto) {
    return this.templatesService.findAll(query);
  }

  @Post('from-template/:templateId')
  @Roles(Role.ADMIN, Role.TRAINER)
  createFromTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() dto: CreateFromTemplateDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.templatesService.createFromTemplate(templateId, dto, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.findOne(id);
  }

  @Post(':id/save-as-template')
  @Roles(Role.ADMIN, Role.TRAINER)
  saveAsTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveAsTemplateDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.templatesService.saveAsTemplate(id, dto, req.user.userId, req.user.role);
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

  @Post(':id/assign')
  @Roles(Role.ADMIN, Role.TRAINER)
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignRoutineFromRoutineDto) {
    return this.userRoutinesService.assign({
      routineId: id,
      userId: dto.userId,
      dayOfWeek: dto.dayOfWeek,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
  }

  @Get(':id/daily-routines')
  @Roles(Role.ADMIN, Role.TRAINER)
  getProgramRoutines(@Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.getProgramRoutines(id);
  }

  @Post(':id/daily-routines')
  @Roles(Role.ADMIN, Role.TRAINER)
  addRoutineToProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddRoutineToProgramDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.addRoutineToProgram(id, dto, req.user.userId, req.user.role);
  }

  @Delete(':id/daily-routines/:routineId')
  @Roles(Role.ADMIN, Role.TRAINER)
  removeRoutineFromProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('routineId', ParseUUIDPipe) routineId: string,
    @Query('dayNumber') dayNumber: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.removeRoutineFromProgram(
      id,
      routineId,
      parseInt(dayNumber, 10),
      req.user.userId,
      req.user.role
    );
  }

  // Program Routine Exercises (personalizaciones por instancia)
  @Get('program-routines/:programRoutineId')
  @Roles(Role.ADMIN, Role.TRAINER)
  getProgramRoutineWithExercises(
    @Param('programRoutineId', ParseUUIDPipe) programRoutineId: string
  ) {
    return this.routinesService.getProgramRoutineWithExercises(programRoutineId);
  }

  @Get('program-routines/:programRoutineId/exercises')
  @Roles(Role.ADMIN, Role.TRAINER)
  getCustomExercises(@Param('programRoutineId', ParseUUIDPipe) programRoutineId: string) {
    return this.routinesService.getCustomExercises(programRoutineId);
  }

  @Post('program-routines/:programRoutineId/exercises')
  @Roles(Role.ADMIN, Role.TRAINER)
  addCustomExercise(
    @Param('programRoutineId', ParseUUIDPipe) programRoutineId: string,
    @Body() dto: CreateProgramRoutineExerciseDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.addCustomExercise(
      programRoutineId,
      dto,
      req.user.userId,
      req.user.role
    );
  }

  @Patch('program-routines/:programRoutineId/exercises/:exerciseId')
  @Roles(Role.ADMIN, Role.TRAINER)
  updateCustomExercise(
    @Param('programRoutineId', ParseUUIDPipe) programRoutineId: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Body() dto: UpdateProgramRoutineExerciseDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.updateCustomExercise(
      programRoutineId,
      exerciseId,
      dto,
      req.user.userId,
      req.user.role
    );
  }

  @Delete('program-routines/:programRoutineId/exercises/:exerciseId')
  @Roles(Role.ADMIN, Role.TRAINER)
  removeCustomExercise(
    @Param('programRoutineId', ParseUUIDPipe) programRoutineId: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.removeCustomExercise(
      programRoutineId,
      exerciseId,
      req.user.userId,
      req.user.role
    );
  }

  @Post('program-routines/:programRoutineId/exercises/bulk')
  @Roles(Role.ADMIN, Role.TRAINER)
  bulkUpdateCustomExercises(
    @Param('programRoutineId', ParseUUIDPipe) programRoutineId: string,
    @Body() dto: BulkUpdateProgramRoutineExercisesDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.routinesService.bulkUpdateCustomExercises(
      programRoutineId,
      dto.exercises,
      req.user.userId,
      req.user.role
    );
  }
}
