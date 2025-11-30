import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== SOLO ADMIN ====================

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createByAdmin(createUserDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('role') role: Role
  ) {
    return await this.usersService.update(id, updateUserDto, role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('role') role: Role) {
    await this.usersService.remove(id, role);
  }

  // ==================== ADMIN Y TRAINER ====================

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER)
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return await this.usersService.findAll(userId, role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role
  ) {
    return await this.usersService.findOne(id, userId, role);
  }

  // ==================== TODOS LOS USUARIOS AUTENTICADOS ====================

  @Get('profile/me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser('userId') userId: string) {
    return await this.usersService.findById(userId);
  }

  @Patch('profile/me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return await this.usersService.updateProfile(userId, updateProfileDto, userId);
  }

  @Patch('profile/me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeMyPassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.usersService.changePassword(userId, changePasswordDto, userId);
  }
}
