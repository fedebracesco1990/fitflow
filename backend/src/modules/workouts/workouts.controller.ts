import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Query,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto, UpdateWorkoutDto, LogExerciseDto, UpdateExerciseLogDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationDto } from '../../common/dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  create(@Body() dto: CreateWorkoutDto, @Request() req: { user: AuthenticatedUser }) {
    return this.workoutsService.create(dto, req.user.userId);
  }

  @Get('my-history')
  findMyHistory(@Request() req: { user: AuthenticatedUser }, @Query() pagination: PaginationDto) {
    return this.workoutsService.findMyHistory(req.user.userId, pagination.page, pagination.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.workoutsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkoutDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.update(id, dto, req.user.userId);
  }

  @Patch(':id/start')
  startWorkout(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.startWorkout(id, req.user.userId);
  }

  @Patch(':id/complete')
  completeWorkout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { duration?: number },
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.completeWorkout(id, req.user.userId, body.duration);
  }

  // Logs de ejercicios
  @Post(':id/exercises')
  logExercise(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LogExerciseDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.logExercise(id, dto, req.user.userId);
  }

  @Get(':id/exercises')
  getExerciseLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.getExerciseLogs(id, req.user.userId);
  }

  @Patch(':id/exercises/:logId')
  updateExerciseLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('logId', ParseUUIDPipe) logId: string,
    @Body() dto: UpdateExerciseLogDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.updateExerciseLog(id, logId, dto, req.user.userId);
  }
}
