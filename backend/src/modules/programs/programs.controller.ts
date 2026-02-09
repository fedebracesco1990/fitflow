import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { AssignProgramDto } from './dto/assign-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  create(@Body() dto: CreateProgramDto, @CurrentUser('userId') userId: string) {
    return this.programsService.create(dto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  findAll() {
    return this.programsService.findAll();
  }

  @Get('my-program')
  getMyProgram(@CurrentUser('userId') userId: string) {
    return this.programsService.getMyProgram(userId);
  }

  @Get('my-program/routines/:routineId')
  getMyRoutine(
    @CurrentUser('userId') userId: string,
    @Param('routineId', ParseUUIDPipe) routineId: string
  ) {
    return this.programsService.getMyRoutine(userId, routineId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.programsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateProgramDto) {
    return this.programsService.update(id, dto);
  }

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  assignToUser(@Body() dto: AssignProgramDto) {
    return this.programsService.assignToUser(dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.programsService.delete(id);
  }
}
