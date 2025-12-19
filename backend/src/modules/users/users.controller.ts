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
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SearchUsersDto } from './dto/search-users.dto';
import { QrService } from '../qr/qr.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly qrService: QrService
  ) {}

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
  async findAll(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
    @Query() searchParams: SearchUsersDto
  ) {
    return await this.usersService.findAll(userId, role, searchParams);
  }

  @Get('export')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async exportMembers(@Res() res: Response) {
    const excelBuffer = await this.usersService.exportMembers();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="miembros-fitflow.xlsx"',
    });
    res.send(excelBuffer);
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

  // ==================== QR CODE ====================

  @Get('profile/me/qr')
  @HttpCode(HttpStatus.OK)
  async getMyQrCode(@CurrentUser('userId') userId: string, @Res() res: Response) {
    const qrBuffer = await this.qrService.generateQrBuffer(userId);
    this.sendQrResponse(res, qrBuffer);
  }

  @Get(':id/qr')
  @Roles(Role.ADMIN, Role.TRAINER)
  @HttpCode(HttpStatus.OK)
  async getUserQrCode(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') currentUserId: string,
    @CurrentUser('role') currentUserRole: Role,
    @Res() res: Response
  ) {
    await this.usersService.findOne(id, currentUserId, currentUserRole);
    const qrBuffer = await this.qrService.generateQrBuffer(id);
    this.sendQrResponse(res, qrBuffer);
  }

  private sendQrResponse(res: Response, qrBuffer: Buffer): void {
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="qr-code.png"',
    });
    res.send(qrBuffer);
  }
}
