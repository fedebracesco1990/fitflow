import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembershipTypesModule } from './modules/membership-types/membership-types.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { RoutinesModule } from './modules/routines/routines.module';
import { UserRoutinesModule } from './modules/user-routines/user-routines.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validationSchema } from './config/validation.schema';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'mysql'>('database.type'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        autoLoadEntities: true,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        timezone: 'Z',
        extra: {
          connectionLimit: 10,
          connectTimeout: 20000,
          charset: 'utf8mb4_unicode_ci',
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    MembershipTypesModule,
    MembershipsModule,
    PaymentsModule,
    ExercisesModule,
    RoutinesModule,
    UserRoutinesModule,
    WorkoutsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
