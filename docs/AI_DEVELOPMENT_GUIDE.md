# Guía de Desarrollo para IA

Esta guía ayuda a la IA a desarrollar features de forma eficiente en FitFlow.

---

## Stack Técnico

| Capa             | Tecnología     | Versión |
| ---------------- | -------------- | ------- |
| Frontend         | Angular        | 20      |
| State Management | NGXS           | 20.1.0  |
| Backend          | NestJS         | 11      |
| ORM              | TypeORM        | 0.3.27  |
| Base de Datos    | MySQL          | 8.0     |
| Autenticación    | JWT + Passport | -       |

---

## Estructura del Proyecto

```
fitflow/
├── frontend/src/app/
│   ├── core/           # Servicios, guards, interceptors, models
│   ├── shared/         # Componentes reutilizables (Button, Card, Alert, etc.)
│   ├── features/       # Módulos por feature (auth, profile, dashboard)
│   └── layouts/        # Layouts (auth-layout, main-layout)
├── backend/src/
│   ├── modules/        # Módulos de dominio (auth, users, exercises, routines, etc.)
│   ├── database/       # Seeders (datos iniciales automáticos)
│   ├── common/         # Enums, utils compartidos
│   └── config/         # Configuración (app, database, jwt)
└── docs/               # Documentación
```

---

## Convenciones de Código

### Frontend

| Elemento   | Convención             | Ejemplo                |
| ---------- | ---------------------- | ---------------------- |
| Selector   | `fit-flow-[nombre]`    | `fit-flow-button`      |
| Componente | PascalCase + Component | `LoginComponent`       |
| Servicio   | PascalCase + Service   | `AuthService`          |
| Archivo    | kebab-case             | `login.component.ts`   |
| Estilos    | `styleUrl` (singular)  | `styleUrl: './x.scss'` |

### Backend

| Elemento   | Convención              | Ejemplo           |
| ---------- | ----------------------- | ----------------- |
| Controller | PascalCase + Controller | `UsersController` |
| Service    | PascalCase + Service    | `UsersService`    |
| DTO        | PascalCase + Dto        | `CreateUserDto`   |
| Entity     | PascalCase (singular)   | `User`            |
| Módulo     | PascalCase + Module     | `UsersModule`     |

---

## Checklist para Nueva Feature

### 1. Backend (crear primero)

```bash
cd backend
nest g res modules/[nombre]  # Genera CRUD completo
```

Archivos a crear/modificar:

- [ ] `modules/[nombre]/[nombre].entity.ts` - Entidad TypeORM
- [ ] `modules/[nombre]/dto/create-[nombre].dto.ts` - DTO de creación
- [ ] `modules/[nombre]/dto/update-[nombre].dto.ts` - DTO de actualización
- [ ] `modules/[nombre]/[nombre].service.ts` - Lógica de negocio
- [ ] `modules/[nombre]/[nombre].controller.ts` - Endpoints REST
- [ ] `modules/[nombre]/[nombre].module.ts` - Módulo NestJS
- [ ] `app.module.ts` - Importar nuevo módulo

### 2. Frontend

```bash
cd frontend
ng g c features/[nombre]/pages/list --standalone
ng g c features/[nombre]/pages/detail --standalone
```

Archivos a crear/modificar:

- [ ] `features/[nombre]/[nombre].routes.ts` - Rutas lazy
- [ ] `features/[nombre]/pages/` - Componentes de página
- [ ] `core/models/[nombre].model.ts` - Interfaces/tipos
- [ ] `core/services/[nombre].service.ts` - Servicio HTTP
- [ ] `core/store/[nombre]/` - Estado NGXS (si aplica)
- [ ] `app.routes.ts` - Agregar ruta lazy

---

## Templates de Código

### Backend: Entity

```typescript
// modules/[nombre]/entities/[nombre].entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('[nombre]s')
export class [Nombre] {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Backend: DTO

```typescript
// modules/[nombre]/dto/create-[nombre].dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class Create[Nombre]Dto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

### Backend: Controller con Roles

```typescript
// modules/[nombre]/[nombre].controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { [Nombre]Service } from './[nombre].service';
import { Create[Nombre]Dto } from './dto/create-[nombre].dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('[nombre]s')
export class [Nombre]Controller {
  constructor(private readonly service: [Nombre]Service) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: Create[Nombre]Dto) {
    return this.service.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
```

### Frontend: Componente Standalone

```typescript
// features/[nombre]/pages/list/list.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '@shared/components/card/card.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { [Nombre]Service } from '@core/services/[nombre].service';

@Component({
  selector: 'fit-flow-[nombre]-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private readonly service = inject([Nombre]Service);

  items = signal<[Nombre][]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadItems();
  }

  private loadItems() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
```

### Frontend: Servicio HTTP

```typescript
// core/services/[nombre].service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { [Nombre] } from '../models/[nombre].model';

@Injectable({
  providedIn: 'root',
})
export class [Nombre]Service {
  private readonly api = inject(ApiService);
  private readonly endpoint = '[nombre]s';

  getAll(): Observable<[Nombre][]> {
    return this.api.get<[Nombre][]>(this.endpoint);
  }

  getById(id: string): Observable<[Nombre]> {
    return this.api.get<[Nombre]>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<[Nombre]>): Observable<[Nombre]> {
    return this.api.post<[Nombre]>(this.endpoint, data);
  }

  update(id: string, data: Partial<[Nombre]>): Observable<[Nombre]> {
    return this.api.patch<[Nombre]>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

### Frontend: Rutas Lazy

```typescript
// features/[nombre]/[nombre].routes.ts
import { Routes } from '@angular/router';

export const [NOMBRE]_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
  },
];
```

---

## Roles y Permisos

| Rol     | Valor     | Permisos                |
| ------- | --------- | ----------------------- |
| ADMIN   | `admin`   | Todo                    |
| TRAINER | `trainer` | CRUD usuarios tipo USER |
| USER    | `user`    | Solo su perfil          |

```typescript
// Decorador para proteger endpoints
@Roles(Role.ADMIN)           // Solo admin
@Roles(Role.ADMIN, Role.TRAINER)  // Admin o trainer
// Sin @Roles = cualquier usuario autenticado
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev:backend          # Docker + Backend
npm run start:frontend       # Frontend

# Verificación
npm run lint                 # Lint completo
npm run build                # Build completo

# Base de datos
npm run db:verify            # Ver usuarios en BD
npm run db:reset             # Reset completo (seed automático al iniciar)
```

---

## Path Aliases (Frontend)

```typescript
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoginComponent } from '@features/auth/pages/login/login.component';
import { environment } from '@env';
```

---

## Flujo de Trabajo Recomendado

1. **Entender el requerimiento** - Qué feature se necesita
2. **Backend primero** - Entity → DTO → Service → Controller → Module
3. **Probar con Postman/curl** - Verificar endpoints funcionan
4. **Frontend después** - Model → Service → Component → Routes
5. **Lint y build** - `npm run lint && npm run build`
6. **Probar en navegador** - Verificar flujo completo

---

## Usuarios de Prueba

| Rol      | Email                | Password    |
| -------- | -------------------- | ----------- |
| ADMIN    | admin@fitflow.com    | Admin123!   |
| TRAINER  | trainer@fitflow.com  | Trainer123! |
| USER     | user1@fitflow.com    | User123!    |
| INACTIVE | inactive@fitflow.com | User123!    |

---

## Notas Importantes

- **No hay tests** - El proyecto no usa tests unitarios/e2e
- **Signals** - Usar `signal()` para estado reactivo, NO `computed()` con forms
- **Getters** - Usar TypeScript getters para validación de formularios
- **Standalone** - Todos los componentes son standalone
- **JWT** - Tokens en localStorage, refresh automático via interceptor
