import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { MuscleGroupsService } from './muscle-groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('muscle-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MuscleGroupsController {
  constructor(private readonly muscleGroupsService: MuscleGroupsService) {}

  @Get()
  @Public()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.muscleGroupsService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.muscleGroupsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body()
    data: {
      code: string;
      name: string;
      description?: string;
      icon?: string;
      order?: number;
    }
  ) {
    return this.muscleGroupsService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    data: { name?: string; description?: string; icon?: string; order?: number; isActive?: boolean }
  ) {
    return this.muscleGroupsService.update(id, data);
  }

  @Post('seed')
  @Roles(Role.ADMIN)
  seed() {
    return this.muscleGroupsService.seed();
  }
}
