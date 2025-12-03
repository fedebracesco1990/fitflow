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
  ForbiddenException,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto, UpdateMembershipDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationDto } from '../../common/dto';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreateMembershipDto) {
    return this.membershipsService.create(createDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() pagination: PaginationDto) {
    return this.membershipsService.findAll(pagination.page, pagination.limit);
  }

  @Get('expiring')
  @Roles(Role.ADMIN)
  findExpiring(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.membershipsService.findExpiringMemberships(daysNum);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN)
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.membershipsService.findByUser(userId);
  }

  @Get('user/:userId/active')
  @Roles(Role.ADMIN, Role.USER)
  findActiveByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    // USER can only see their own membership
    if (req.user.role === Role.USER && req.user.userId !== userId) {
      throw new ForbiddenException('Solo puedes ver tu propia membresía');
    }
    return this.membershipsService.findActiveByUser(userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateMembershipDto) {
    return this.membershipsService.update(id, updateDto);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipsService.cancel(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipsService.remove(id);
  }

  @Post('update-expired')
  @Roles(Role.ADMIN)
  updateExpired() {
    return this.membershipsService.updateExpiredMemberships();
  }
}
