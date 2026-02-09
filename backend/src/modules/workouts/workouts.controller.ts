import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Query,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { UpdateWorkoutDto, UpdateExerciseLogDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationDto } from '../../common/dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('start/:routineId')
  startWorkout(
    @Param('routineId', ParseUUIDPipe) routineId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.startWorkout(routineId, req.user.userId);
  }

  @Get('my-history')
  findMyHistory(@Request() req: { user: AuthenticatedUser }, @Query() pagination: PaginationDto) {
    return this.workoutsService.findMyHistory(req.user.userId, pagination.page, pagination.limit);
  }

  @Get('last/:routineId')
  getLastWorkout(
    @Param('routineId', ParseUUIDPipe) routineId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.getLastWorkoutForRoutine(routineId, req.user.userId);
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

  @Patch(':id/complete')
  completeWorkout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { duration?: number },
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.completeWorkout(id, req.user.userId, body.duration);
  }

  @Get(':id/exercises')
  getExerciseLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.getExerciseLogs(id, req.user.userId);
  }

  @Post(':id/exercises')
  addExerciseLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { exerciseId: string; setNumber: number; reps: number; weight: number | null },
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.addExerciseLog(id, body.exerciseId, body, req.user.userId);
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

  @Delete(':id/exercises/:logId')
  deleteExerciseLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('logId', ParseUUIDPipe) logId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.workoutsService.deleteExerciseLog(id, logId, req.user.userId);
  }
}
