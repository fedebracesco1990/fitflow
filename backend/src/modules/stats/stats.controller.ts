import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { StatsQueryDto } from './dto';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me/progress/:exerciseId')
  getMyExerciseProgress(
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Query() query: StatsQueryDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.statsService.getExerciseProgress(
      req.user.userId,
      exerciseId,
      query.startDate,
      query.endDate
    );
  }

  @Get('me/volume')
  getMyVolumeStats(
    @Query() query: StatsQueryDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.statsService.getVolumeStats(
      req.user.userId,
      query.startDate,
      query.endDate
    );
  }

  @Get('me/monthly')
  getMyMonthlyComparison(@Request() req: { user: AuthenticatedUser }) {
    return this.statsService.getMonthlyComparison(req.user.userId);
  }

  @Get('users/:userId/progress/:exerciseId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  getUserExerciseProgress(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Query() query: StatsQueryDto
  ) {
    return this.statsService.getExerciseProgress(
      userId,
      exerciseId,
      query.startDate,
      query.endDate
    );
  }

  @Get('users/:userId/volume')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  getUserVolumeStats(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: StatsQueryDto
  ) {
    return this.statsService.getVolumeStats(userId, query.startDate, query.endDate);
  }

  @Get('users/:userId/monthly')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  getUserMonthlyComparison(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.statsService.getMonthlyComparison(userId);
  }
}
