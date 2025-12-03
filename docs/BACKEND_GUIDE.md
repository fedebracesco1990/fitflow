# FitFlow Backend - Guía de Desarrollo

## Tecnologías

- **Framework:** NestJS
- **Base de datos:** MySQL + TypeORM
- **Autenticación:** JWT (access + refresh tokens)
- **Validación:** class-validator + class-transformer
- **Documentación:** Swagger/OpenAPI

---

## Estructura Actual

```
backend/src/
├── app.controller.ts      # Health check endpoint
├── app.module.ts          # Módulo raíz
├── app.service.ts         # Servicio raíz
├── main.ts                # Entry point
├── modules/               # Módulos de dominio
│   ├── auth/              # Módulo de autenticación
│   │   ├── decorators/    # @CurrentUser, @Public, @Roles
│   │   ├── dto/           # Login, Register, etc.
│   │   ├── guards/        # JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   │   ├── interfaces/    # JwtPayload, etc.
│   │   ├── strategies/    # JWT strategies
│   │   ├── types/         # Tipos auxiliares
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   └── users/             # Módulo de usuarios
│       ├── dto/           # UpdateProfile, ChangePassword
│       ├── entities/      # User entity
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
├── common/                # Utilidades compartidas
│   └── enums/             # Role, Difficulty, DayOfWeek, WorkoutStatus
└── config/                # Configuración
    ├── app.config.ts
    ├── database.config.ts
    ├── jwt.config.ts
    └── validation.schema.ts
```

---

## Flujo de Desarrollo de Features

### Orden de Implementación

```
1. Entity      → Modelo de base de datos
2. DTOs        → Validación de entrada/salida
3. Service     → Lógica de negocio
4. Controller  → Endpoints REST
5. Module      → Registro de dependencias
6. Tests       → Unitarios e integración
```

### Checklist

```markdown
## Feature: [Nombre]

- [ ] **Entity**

  - [ ] Crear entity en `[feature]/entities/`
  - [ ] Definir relaciones con otras entidades
  - [ ] Agregar decoradores de TypeORM
  - [ ] Registrar en TypeOrmModule del módulo

- [ ] **DTOs**

  - [ ] Create DTO con validaciones class-validator
  - [ ] Update DTO (PartialType o campos específicos)
  - [ ] Response DTO (si difiere de la entity)
  - [ ] Query DTO (para filtros/paginación)

- [ ] **Service**

  - [ ] Inyectar repositorio
  - [ ] Implementar CRUD básico
  - [ ] Agregar lógica de negocio específica
  - [ ] Manejar errores con excepciones HTTP

- [ ] **Controller**

  - [ ] Definir rutas REST
  - [ ] Aplicar guards de autenticación
  - [ ] Aplicar guards de roles (si aplica)
  - [ ] Documentar con Swagger decorators

- [ ] **Module**
  - [ ] Importar TypeOrmModule.forFeature([Entity])
  - [ ] Registrar Service y Controller
  - [ ] Exportar Service (si lo usan otros módulos)
  - [ ] Importar en AppModule
```

---

## Plantillas de Código

### Entity

```typescript
// modules/[feature]/entities/[feature].entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('[features]') // nombre en plural, snake_case
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### DTOs

```typescript
// modules/[feature]/dto/create-[feature].dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Nombre del feature', example: 'Mi Feature' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción opcional' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

// modules/[feature]/dto/update-[feature].dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFeatureDto } from './create-feature.dto';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
```

### Service

```typescript
// modules/[feature]/[feature].service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>
  ) {}

  async create(userId: string, dto: CreateFeatureDto): Promise<Feature> {
    const feature = this.featureRepository.create({
      ...dto,
      userId,
    });
    return this.featureRepository.save(feature);
  }

  async findAllByUser(userId: string): Promise<Feature[]> {
    return this.featureRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Feature> {
    const feature = await this.featureRepository.findOne({
      where: { id },
    });

    if (!feature) {
      throw new NotFoundException('Feature no encontrado');
    }

    if (feature.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este recurso');
    }

    return feature;
  }

  async update(id: string, userId: string, dto: UpdateFeatureDto): Promise<Feature> {
    const feature = await this.findOne(id, userId);
    Object.assign(feature, dto);
    return this.featureRepository.save(feature);
  }

  async remove(id: string, userId: string): Promise<void> {
    const feature = await this.findOne(id, userId);
    await this.featureRepository.remove(feature);
  }
}
```

### Controller

```typescript
// modules/[feature]/[feature].controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@ApiTags('Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo feature' })
  @ApiResponse({ status: 201, description: 'Feature creado exitosamente' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateFeatureDto) {
    return this.featureService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los features del usuario' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.featureService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un feature por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('userId') userId: string) {
    return this.featureService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un feature' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateFeatureDto
  ) {
    return this.featureService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un feature' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('userId') userId: string) {
    return this.featureService.remove(id, userId);
  }
}
```

### Module

```typescript
// modules/[feature]/[feature].module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Solo si otros módulos lo necesitan
})
export class FeatureModule {}
```

---

## Convenciones de Nombres

| Tipo       | Convención              | Ejemplo                 |
| ---------- | ----------------------- | ----------------------- |
| Entity     | PascalCase, singular    | `Workout`, `Exercise`   |
| Table      | snake_case, plural      | `workouts`, `exercises` |
| DTO        | PascalCase + Dto        | `CreateWorkoutDto`      |
| Service    | PascalCase + Service    | `WorkoutService`        |
| Controller | PascalCase + Controller | `WorkoutController`     |
| Module     | PascalCase + Module     | `WorkoutModule`         |
| Archivo    | kebab-case              | `workout.service.ts`    |

### Endpoints REST

| Acción     | Método    | Ruta              | Ejemplo                |
| ---------- | --------- | ----------------- | ---------------------- |
| Listar     | GET       | `/[recursos]`     | `GET /workouts`        |
| Obtener    | GET       | `/[recursos]/:id` | `GET /workouts/123`    |
| Crear      | POST      | `/[recursos]`     | `POST /workouts`       |
| Actualizar | PUT/PATCH | `/[recursos]/:id` | `PUT /workouts/123`    |
| Eliminar   | DELETE    | `/[recursos]/:id` | `DELETE /workouts/123` |

---

## Comandos Útiles

```bash
# Generar módulo con NestJS CLI
nest g module [feature]
nest g service [feature]
nest g controller [feature]

# Ejecutar migraciones
npm run migration:generate -- src/migrations/Add[Feature]
npm run migration:run

# Desarrollo
npm run start:dev

# Build
npm run build

# Tests
npm run test
npm run test:e2e
```

---

## Mejoras Pendientes

### 🟡 Prioridad Media

1. **Expandir `common/`** - Agregar subcarpetas para decoradores, exceptions, filters, pipes, utils

### 🟢 Prioridad Baja

2. **Capa de repositorios** - Para queries complejas, separar lógica de acceso a datos

---

## Seguridad

### Middlewares Globales

El backend implementa las siguientes medidas de seguridad:

1. **Helmet** - Headers de seguridad HTTP
2. **Rate Limiting** - 60 requests por minuto por IP (ThrottlerModule)
3. **CORS** - Configurado para orígenes permitidos
4. **Validation Pipe** - Validación automática de DTOs

### Autenticación y Autorización

- **JWT Auth Guard** - Protege todas las rutas por defecto
- **Roles Guard** - Control de acceso basado en roles (ADMIN, TRAINER, USER)
- **@Public()** - Decorator para rutas públicas

### Buenas Prácticas Implementadas

1. **No exponer información sensible** - forgotPassword no revela si un email existe
2. **Logging de seguridad** - Eventos de login, logout, y password reset se registran
3. **Ownership validation** - Usuarios solo pueden acceder a sus propios recursos
4. **Tokens hasheados** - Refresh tokens y reset tokens se almacenan hasheados

### Paginación

Los endpoints que retornan listas soportan paginación:

```typescript
// Query params
GET /api/payments?page=1&limit=20

// Respuesta
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Transacciones

Para operaciones críticas que modifican múltiples tablas:

```typescript
async create(dto: CreateDto): Promise<Entity> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // operaciones...
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

## Notas Importantes

1. **Siempre validar DTOs** - Usar class-validator en todos los DTOs de entrada
2. **Documentar con Swagger** - Todos los endpoints deben tener decoradores de documentación
3. **Manejar errores** - Usar excepciones HTTP de NestJS (NotFoundException, ForbiddenException, etc.)
4. **Proteger endpoints** - Aplicar JwtAuthGuard a rutas que requieren autenticación
5. **Verificar ownership** - Siempre verificar que el usuario tenga acceso al recurso
