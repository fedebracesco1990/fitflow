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
import * as ExcelJS from 'exceljs';

interface RawUserMembershipResult {
  user_id: string;
  user_name: string;
  user_email: string;
  membership_id: string | null;
  membership_status: string | null;
  membership_endDate: Date | null;
  membershipType_name: string | null;
}

interface UserMembershipData {
  name: string;
  email: string;
  memberships: Array<{
    status: string;
    endDate: Date;
    membershipTypeName: string;
  }>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  // ==================== CREAR USUARIOS ====================

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

  // ==================== BUSCAR USUARIOS ====================

  async findAll(
    currentUserId: string,
    currentUserRole: Role,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<User>> {
    let query = this.usersRepository.createQueryBuilder('user');

    if (currentUserRole === Role.TRAINER) {
      query = query.where('user.role = :role', { role: Role.USER });
    }

    query = query.andWhere('user.isActive = :isActive', { isActive: true });

    const total = await query.getCount();

    query = query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.name', 'ASC');

    const data = await query.getMany();

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
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // ==================== ACTUALIZAR USUARIOS ====================

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

  // ==================== ELIMINAR USUARIOS (SOFT DELETE) ====================

  async remove(id: string, currentUserRole: Role): Promise<void> {
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permisos para eliminar usuarios');
    }

    const user = await this.findById(id);

    // Soft delete
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  // ==================== REFRESH TOKEN ====================

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : undefined;

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

  // ==================== MÉTODOS DE SISTEMA (AUTH / RECUPERACIÓN) ====================
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

  // ==================== EXPORT ====================

  async exportMembers(): Promise<Buffer> {
    // Query con LEFT JOIN para incluir usuarios sin membresía
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('memberships', 'membership', 'membership.userId = user.id')
      .leftJoin(
        'membership_types',
        'membershipType',
        'membershipType.id = membership.membershipTypeId'
      )
      .select([
        'user.id',
        'user.name',
        'user.email',
        'membership.id',
        'membership.status',
        'membership.endDate',
        'membershipType.name',
      ])
      .where('user.isActive = :isActive', { isActive: true })
      .orderBy('user.name', 'ASC')
      .getRawMany<RawUserMembershipResult>();

    // Agrupar por usuario y obtener membresía más relevante
    const userMap = new Map<string, UserMembershipData>();

    users.forEach((row) => {
      const userId = row.user_id;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          name: row.user_name,
          email: row.user_email,
          memberships: [],
        });
      }

      if (
        row.membership_id &&
        row.membership_status &&
        row.membership_endDate &&
        row.membershipType_name
      ) {
        const userData = userMap.get(userId);
        if (userData) {
          userData.memberships.push({
            status: row.membership_status,
            endDate: row.membership_endDate,
            membershipTypeName: row.membershipType_name,
          });
        }
      }
    });

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Miembros');

    // Definir columnas
    worksheet.columns = [
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Tipo de Membresía', key: 'membershipType', width: 25 },
      { header: 'Estado', key: 'status', width: 20 },
      { header: 'Fecha Vencimiento', key: 'endDate', width: 20 },
    ];

    // Traducir estados
    const statusTranslations: Record<string, string> = {
      active: 'Activa',
      expired: 'Vencida',
      cancelled: 'Cancelada',
      grace_period: 'Período de Gracia',
    };

    // Formatear fecha DD/MM/YYYY
    const formatDate = (date: Date | string | null): string => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Mapear datos
    userMap.forEach((userData) => {
      let relevantMembership: UserMembershipData['memberships'][0] | null = null;

      if (userData.memberships.length > 0) {
        // Prioridad: ACTIVE > GRACE_PERIOD > más reciente
        const activeMembership = userData.memberships.find((m) => m.status === 'active');
        const gracePeriodMembership = userData.memberships.find((m) => m.status === 'grace_period');

        if (activeMembership) {
          relevantMembership = activeMembership;
        } else if (gracePeriodMembership) {
          relevantMembership = gracePeriodMembership;
        } else {
          relevantMembership = userData.memberships.sort(
            (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          )[0];
        }
      }

      worksheet.addRow({
        name: userData.name,
        email: userData.email,
        membershipType: relevantMembership?.membershipTypeName || 'Sin membresía',
        status: relevantMembership
          ? statusTranslations[relevantMembership.status] || relevantMembership.status
          : 'Sin membresía',
        endDate: relevantMembership ? formatDate(relevantMembership.endDate) : '',
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
