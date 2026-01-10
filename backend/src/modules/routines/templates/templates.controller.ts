import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { SaveAsTemplateDto, FilterTemplatesDto, CreateFromTemplateDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('templates')
  @Roles(Role.ADMIN, Role.TRAINER)
  findAll(@Query() query: FilterTemplatesDto) {
    return this.templatesService.findAll(query);
  }

  @Post(':id/save-as-template')
  @Roles(Role.ADMIN, Role.TRAINER)
  saveAsTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveAsTemplateDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.templatesService.saveAsTemplate(id, dto, req.user.userId, req.user.role);
  }

  @Post('from-template/:templateId')
  @Roles(Role.ADMIN, Role.TRAINER)
  createFromTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() dto: CreateFromTemplateDto,
    @Request() req: { user: AuthenticatedUser }
  ) {
    return this.templatesService.createFromTemplate(templateId, dto, req.user.userId);
  }
}
