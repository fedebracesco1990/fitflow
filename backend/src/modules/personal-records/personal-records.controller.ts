import { Controller, Get, Param, ParseUUIDPipe, Request, UseGuards } from '@nestjs/common';
import { PersonalRecordsService } from './personal-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('personal-records')
@UseGuards(JwtAuthGuard)
export class PersonalRecordsController {
  constructor(private readonly personalRecordsService: PersonalRecordsService) {}

  @Get('me')
  getMyPersonalRecords(@Request() req: { user: AuthenticatedUser }) {
    return this.personalRecordsService.getUserPersonalRecords(req.user.userId);
  }

  @Get('me/:exerciseId')
  getMyPersonalRecordByExercise(
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.personalRecordsService.getPersonalRecordByExercise(req.user.userId, exerciseId);
  }

  @Get('users/:userId')
  @Roles(Role.ADMIN, Role.TRAINER)
  getUserPersonalRecords(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.personalRecordsService.getUserPersonalRecords(userId);
  }

  @Get('users/:userId/:exerciseId')
  @Roles(Role.ADMIN, Role.TRAINER)
  getUserPersonalRecordByExercise(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string
  ) {
    return this.personalRecordsService.getPersonalRecordByExercise(userId, exerciseId);
  }
}
