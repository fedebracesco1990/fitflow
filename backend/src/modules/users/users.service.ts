import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../../common/enums/role.enum';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import * as bcrypt from 'bcrypt';
import { SearchUsersDto } from './dto/search-users.dto';
import {
  AttendanceService,
  LowAttendanceUserData,
  InactiveUserData,
} from '../attendance/attendance.service';
import { LowAttendanceResponseDto } from './dto/low-attendance-user.dto';
import { InactiveUsersResponseDto } from './dto/inactive-users.dto';
import { MembershipStatus } from '../memberships/entities/membership.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly attendanceService: AttendanceService
  ) {}

  // ==================== CREATE USERS ====================

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    const user = this.usersRepository.create({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
    });

    return await this.usersRepository.save(user);
  }

  async createByAdmin(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
    });

    return await this.usersRepository.save(user);
  }

  // ==================== FIND USERS ====================

  async findAll(
    currentUserId: string,
    currentUserRole: Role,
    searchParams: SearchUsersDto
  ): Promise<PaginatedResponse<User>> {
    const { search, role, membershipStatus, page = 1, limit = 20 } = searchParams;

    // Base query for counting
    let countQuery = this.usersRepository.createQueryBuilder('user');

    // Base filter: active users only
    countQuery = countQuery.where('user.isActive = :isActive', { isActive: true });

    // Filter by the current user's role
    if (currentUserRole === Role.TRAINER) {
      countQuery = countQuery.andWhere('user.role = :userRole', { userRole: Role.USER });
    }

    // Search by name or email
    if (search) {
      countQuery = countQuery.andWhere('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Filter by role
    if (role) {
      countQuery = countQuery.andWhere('user.role = :role', { role });
    }

    // Filter by membership status
    if (membershipStatus) {
      countQuery = countQuery
        .innerJoin('user.memberships', 'membership')
        .andWhere('membership.status = :membershipStatus', { membershipStatus });
    }

    // Count total
    const total = await countQuery.getCount();

    // Query to fetch data with pagination
    let dataQuery = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.memberships', 'membership')
      .leftJoinAndSelect('membership.membershipType', 'membershipType');

    // Apply the same filters
    dataQuery = dataQuery.where('user.isActive = :isActive', { isActive: true });

    if (currentUserRole === Role.TRAINER) {
      dataQuery = dataQuery.andWhere('user.role = :userRole', { userRole: Role.USER });
    }

    if (search) {
      dataQuery = dataQuery.andWhere('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      dataQuery = dataQuery.andWhere('user.role = :role', { role });
    }

    if (membershipStatus) {
      dataQuery = dataQuery.andWhere('membership.status = :membershipStatus', {
        membershipStatus,
      });
    }

    // Apply pagination and sorting
    dataQuery = dataQuery
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.name', 'ASC');

    const data = await dataQuery.getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUserId: string, currentUserRole: Role): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.checkViewPermission(user, currentUserId, currentUserRole);

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase() })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Safe version that returns null instead of throwing exception.
   * Used for password reset to prevent user enumeration.
   */
  async findByEmailSafe(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['memberships', 'memberships.membershipType'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // ==================== UPDATE USERS ====================

  async update(id: string, updateUserDto: UpdateUserDto, currentUserRole: Role): Promise<User> {
    const user = await this.findById(id);

    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permisos para actualizar usuarios');
    }

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('El email ya está en uso');
      }

      updateUserDto.email = updateUserDto.email.toLowerCase();
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
    currentUserId: string
  ): Promise<User> {
    if (id !== currentUserId) {
      throw new ForbiddenException('Solo puedes actualizar tu propio perfil');
    }

    const user = await this.findById(id);

    Object.assign(user, updateProfileDto);
    return await this.usersRepository.save(user);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
    currentUserId: string
  ): Promise<void> {
    if (id !== currentUserId) {
      throw new ForbiddenException('Solo puedes cambiar tu propia contraseña');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await User.comparePasswords(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    user.password = changePasswordDto.newPassword;
    await this.usersRepository.save(user);
  }

  // ==================== DELETE USERS (SOFT DELETE) ====================

  async remove(id: string, currentUserRole: Role): Promise<void> {
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permisos para eliminar usuarios');
    }

    const user = await this.findById(id);

    // Soft delete
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  // ==================== SECURITY: ACCOUNT LOCKOUT ====================

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const LOCKOUT_THRESHOLD = 5;
    const LOCKOUT_DURATION_MINUTES = 15;

    await this.usersRepository.increment({ id: userId }, 'failedLoginAttempts', 1);

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'failedLoginAttempts'],
    });

    if (user && user.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
      await this.usersRepository.update(userId, { lockedUntil });
    }
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    // null (not undefined): TypeORM ignores undefined fields on update and the old hash would remain stored
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .addSelect('user.refreshToken')
      .getOne();

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    return user;
  }

  // ==================== SYSTEM METHODS (AUTH / RECOVERY) ====================
  async setResetPasswordToken(userId: string, hashedToken: string, expires: Date): Promise<void> {
    await this.usersRepository.update(userId, {
      resetPasswordTokenHash: hashedToken,
      resetPasswordExpires: expires,
    });
  }

  async findOneWithResetToken(userId: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .addSelect(['user.resetPasswordTokenHash', 'user.resetPasswordExpires'])
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async updatePasswordFromReset(userId: string, newPlainPassword: string): Promise<void> {
    const user = await this.findById(userId);

    user.password = newPlainPassword;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;

    await this.usersRepository.save(user);
  }

  // ==================== HELPER METHODS ====================

  private checkViewPermission(user: User, currentUserId: string, currentUserRole: Role): void {
    if (user.id === currentUserId) {
      return;
    }

    if (currentUserRole === Role.ADMIN) {
      return;
    }

    if (currentUserRole === Role.TRAINER) {
      if (user.role !== Role.USER) {
        throw new ForbiddenException('No tienes permisos para ver este perfil');
      }
      return;
    }

    if (currentUserRole === Role.USER) {
      throw new ForbiddenException('No tienes permisos para ver este perfil');
    }
  }

  // ==================== LOW ATTENDANCE ====================

  async findLowAttendanceUsers(
    month?: number,
    year?: number,
    minVisits: number = 8
  ): Promise<LowAttendanceResponseDto> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const usersWithLowAttendance = await this.attendanceService.findUsersWithLowAttendanceDetails(
      minVisits,
      targetMonth,
      targetYear
    );

    const usersWithMembership = await Promise.all(
      usersWithLowAttendance.map(async (userData: LowAttendanceUserData) => {
        const user = await this.usersRepository.findOne({
          where: { id: userData.userId },
          relations: ['memberships'],
        });

        const activeMembership = user?.memberships?.find(
          (m) => m.status === MembershipStatus.ACTIVE || m.status === MembershipStatus.GRACE_PERIOD
        );

        return {
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          visitCount: userData.visitCount,
          lastAttendanceDate: userData.lastAttendanceDate,
          membershipStatus: activeMembership?.status ?? null,
        };
      })
    );

    return {
      users: usersWithMembership,
      meta: {
        total: usersWithMembership.length,
        month: targetMonth,
        year: targetYear,
        minVisitsThreshold: minVisits,
      },
    };
  }

  async findInactiveUsers(daysSinceLastVisit: number = 7): Promise<InactiveUsersResponseDto> {
    const inactiveUsers = await this.attendanceService.findInactiveUsersByDays(daysSinceLastVisit);

    const usersWithMembership = await Promise.all(
      inactiveUsers.map(async (userData: InactiveUserData) => {
        const user = await this.usersRepository.findOne({
          where: { id: userData.userId },
          relations: ['memberships'],
        });

        const activeMembership = user?.memberships?.find(
          (m) => m.status === MembershipStatus.ACTIVE || m.status === MembershipStatus.GRACE_PERIOD
        );

        return {
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          lastAttendanceDate: userData.lastAttendanceDate,
          daysSinceLastVisit: userData.daysSinceLastVisit,
          membershipStatus: activeMembership?.status ?? null,
        };
      })
    );

    return {
      users: usersWithMembership,
      meta: {
        total: usersWithMembership.length,
        daysSinceLastVisitThreshold: daysSinceLastVisit,
      },
    };
  }
}
