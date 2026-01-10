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
  Request,
} from '@nestjs/common';
import { UserRoutinesService } from './user-routines.service';
import { AssignRoutineDto, UpdateUserRoutineDto, BulkAssignRoutineDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Controller('user-routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserRoutinesController {
  constructor(private readonly userRoutinesService: UserRoutinesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRAINER)
  assign(@Body() dto: AssignRoutineDto) {
    return this.userRoutinesService.assign(dto);
  }

  @Post('bulk')
  @Roles(Role.ADMIN, Role.TRAINER)
  assignBulk(@Body() dto: BulkAssignRoutineDto) {
    return this.userRoutinesService.assignBulk(dto);
  }

  @Get('my-week')
  getMyWeek(@Request() req: { user: AuthenticatedUser }) {
    return this.userRoutinesService.getMyWeek(req.user.userId);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.TRAINER)
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRoutinesService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRoutinesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserRoutineDto) {
    return this.userRoutinesService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.TRAINER)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRoutinesService.deactivate(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRoutinesService.remove(id);
  }
}
