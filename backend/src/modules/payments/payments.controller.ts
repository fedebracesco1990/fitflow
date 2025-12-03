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
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationDto } from '../../common/dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreatePaymentDto, @Request() req: { user: AuthenticatedUser }) {
    return this.paymentsService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() pagination: PaginationDto) {
    return this.paymentsService.findAll(pagination.page, pagination.limit);
  }

  @Get('current-month')
  @Roles(Role.ADMIN)
  getCurrentMonth() {
    return this.paymentsService.getCurrentMonthPayments();
  }

  @Get('membership/:membershipId')
  @Roles(Role.ADMIN)
  findByMembership(@Param('membershipId', ParseUUIDPipe) membershipId: string) {
    return this.paymentsService.findByMembership(membershipId);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.USER)
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: { user: AuthenticatedUser }
  ) {
    // USER can only see their own payments
    if (req.user.role === Role.USER && req.user.userId !== userId) {
      throw new ForbiddenException('Solo puedes ver tus propios pagos');
    }
    return this.paymentsService.findByUser(userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.remove(id);
  }
}
