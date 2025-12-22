import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuscleGroupsService } from '../../modules/muscle-groups/muscle-groups.service';
import { User } from '../../modules/users/entities/user.entity';
import { Exercise } from '../../modules/exercises/entities/exercise.entity';
import { MuscleGroup } from '../../modules/muscle-groups/entities/muscle-group.entity';
import { Routine } from '../../modules/routines/entities/routine.entity';
import { RoutineExercise } from '../../modules/routines/entities/routine-exercise.entity';
import { UserRoutine } from '../../modules/user-routines/entities/user-routine.entity';
import { MembershipType } from '../../modules/membership-types/entities/membership-type.entity';
import { Membership, MembershipStatus } from '../../modules/memberships/entities/membership.entity';
import { Payment, PaymentMethod } from '../../modules/payments/entities/payment.entity';
import { AccessLog } from '../../modules/access/entities/access-log.entity';
import { Role } from '../../common/enums/role.enum';
import { Difficulty } from '../../common/enums/difficulty.enum';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { AccessType } from '../../common/enums/access-type.enum';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly muscleGroupsService: MuscleGroupsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(MuscleGroup)
    private readonly muscleGroupRepository: Repository<MuscleGroup>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>,
    @InjectRepository(UserRoutine)
    private readonly userRoutineRepository: Repository<UserRoutine>,
    @InjectRepository(MembershipType)
    private readonly membershipTypeRepository: Repository<MembershipType>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>
  ) {}

  async onModuleInit() {
    // Esperar 3 segundos para que TypeORM termine de sincronizar las tablas
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await this.seed();
  }

  async seed() {
    this.logger.log('🌱 Iniciando seed de datos...');

    await this.seedUsers();
    await this.seedMuscleGroups();
    await this.seedExercises();
    await this.seedRoutines();
    await this.seedUserRoutines();
    await this.seedMembershipTypes();
    await this.seedMemberships();
    await this.seedPayments();
    await this.seedAccessLogs();

    this.logger.log('✅ Seed completado');
  }

  async seedUsers() {
    const usersToSeed = [
      {
        email: 'admin@fitflow.com',
        password: 'Admin123!',
        name: 'Administrador Principal',
        role: Role.ADMIN,
        isActive: true,
      },
      {
        email: 'trainer@fitflow.com',
        password: 'Trainer123!',
        name: 'Carlos Pérez - Entrenador',
        role: Role.TRAINER,
        isActive: true,
      },
      {
        email: 'user1@fitflow.com',
        password: 'User123!',
        name: 'Juan García',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user2@fitflow.com',
        password: 'User123!',
        name: 'María López',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'inactive@fitflow.com',
        password: 'User123!',
        name: 'Usuario Inactivo',
        role: Role.USER,
        isActive: false,
      },
    ];

    for (const userData of usersToSeed) {
      try {
        const existing = await this.userRepository.findOne({
          where: { email: userData.email },
        });

        if (!existing) {
          const user = this.userRepository.create(userData);
          await this.userRepository.save(user);
          const status = userData.isActive ? '' : ' (inactivo)';
          this.logger.log(`  ✓ Usuario creado: ${userData.email} (${userData.role})${status}`);
        } else {
          this.logger.log(`  - Usuario ya existe: ${userData.email}`);
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando usuario ${userData.email}`, error);
      }
    }
  }

  async seedMuscleGroups() {
    try {
      await this.muscleGroupsService.seed();
      this.logger.log('  ✓ Grupos musculares sembrados');
    } catch (error) {
      this.logger.error('  ✗ Error al sembrar grupos musculares', error);
    }
  }

  async seedExercises() {
    const exercisesData = [
      // Pecho
      {
        name: 'Press de Banca',
        muscleCode: 'chest',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Acostado en banco plano, bajar barra al pecho y empujar',
      },
      {
        name: 'Press Inclinado con Mancuernas',
        muscleCode: 'chest',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'En banco inclinado, press con mancuernas',
      },
      {
        name: 'Fondos en Paralelas',
        muscleCode: 'chest',
        difficulty: Difficulty.ADVANCED,
        description: 'Bajar el cuerpo flexionando codos y empujar',
      },
      {
        name: 'Aperturas con Mancuernas',
        muscleCode: 'chest',
        difficulty: Difficulty.BEGINNER,
        description: 'Movimiento de apertura y cierre con brazos',
      },
      // Espalda
      {
        name: 'Dominadas',
        muscleCode: 'back',
        difficulty: Difficulty.ADVANCED,
        description: 'Colgarse de barra y subir el cuerpo',
      },
      {
        name: 'Remo con Barra',
        muscleCode: 'back',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Inclinado, tirar barra hacia el abdomen',
      },
      {
        name: 'Jalón al Pecho',
        muscleCode: 'back',
        difficulty: Difficulty.BEGINNER,
        description: 'En máquina, tirar barra hacia el pecho',
      },
      {
        name: 'Remo con Mancuerna',
        muscleCode: 'back',
        difficulty: Difficulty.BEGINNER,
        description: 'Apoyado en banco, tirar mancuerna',
      },
      // Hombros
      {
        name: 'Press Militar',
        muscleCode: 'shoulders',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Empujar barra sobre la cabeza',
      },
      {
        name: 'Elevaciones Laterales',
        muscleCode: 'shoulders',
        difficulty: Difficulty.BEGINNER,
        description: 'Elevar mancuernas a los lados',
      },
      {
        name: 'Elevaciones Frontales',
        muscleCode: 'shoulders',
        difficulty: Difficulty.BEGINNER,
        description: 'Elevar mancuernas al frente',
      },
      // Bíceps
      {
        name: 'Curl con Barra',
        muscleCode: 'biceps',
        difficulty: Difficulty.BEGINNER,
        description: 'Flexionar codos subiendo barra',
      },
      {
        name: 'Curl con Mancuernas',
        muscleCode: 'biceps',
        difficulty: Difficulty.BEGINNER,
        description: 'Curl alternado con mancuernas',
      },
      {
        name: 'Curl Martillo',
        muscleCode: 'biceps',
        difficulty: Difficulty.BEGINNER,
        description: 'Curl con agarre neutro',
      },
      // Tríceps
      {
        name: 'Fondos en Banco',
        muscleCode: 'triceps',
        difficulty: Difficulty.BEGINNER,
        description: 'Bajar y subir apoyado en banco',
      },
      {
        name: 'Extensión de Tríceps',
        muscleCode: 'triceps',
        difficulty: Difficulty.BEGINNER,
        description: 'Extensión sobre la cabeza',
      },
      {
        name: 'Press Francés',
        muscleCode: 'triceps',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Acostado, bajar barra a la frente',
      },
      // Piernas
      {
        name: 'Sentadilla',
        muscleCode: 'legs',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Bajar flexionando rodillas y caderas',
      },
      {
        name: 'Prensa de Piernas',
        muscleCode: 'legs',
        difficulty: Difficulty.BEGINNER,
        description: 'Empujar plataforma con piernas',
      },
      {
        name: 'Extensión de Cuádriceps',
        muscleCode: 'legs',
        difficulty: Difficulty.BEGINNER,
        description: 'En máquina, extender piernas',
      },
      {
        name: 'Curl de Piernas',
        muscleCode: 'legs',
        difficulty: Difficulty.BEGINNER,
        description: 'Flexionar piernas en máquina',
      },
      {
        name: 'Zancadas',
        muscleCode: 'legs',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Dar paso largo y bajar',
      },
      // Glúteos
      {
        name: 'Hip Thrust',
        muscleCode: 'glutes',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Empuje de cadera con barra',
      },
      {
        name: 'Peso Muerto Rumano',
        muscleCode: 'glutes',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Bajar barra manteniendo piernas semi-flexionadas',
      },
      // Core
      {
        name: 'Plancha',
        muscleCode: 'core',
        difficulty: Difficulty.BEGINNER,
        description: 'Mantener posición de plancha',
      },
      {
        name: 'Crunch Abdominal',
        muscleCode: 'core',
        difficulty: Difficulty.BEGINNER,
        description: 'Elevar torso contrayendo abdomen',
      },
      {
        name: 'Elevación de Piernas',
        muscleCode: 'core',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Elevar piernas acostado',
      },
      // Cardio
      {
        name: 'Burpees',
        muscleCode: 'cardio',
        difficulty: Difficulty.ADVANCED,
        description: 'Flexión, salto y repetir',
      },
      {
        name: 'Mountain Climbers',
        muscleCode: 'cardio',
        difficulty: Difficulty.INTERMEDIATE,
        description: 'Correr en posición de plancha',
      },
      {
        name: 'Jumping Jacks',
        muscleCode: 'cardio',
        difficulty: Difficulty.BEGINNER,
        description: 'Saltar abriendo brazos y piernas',
      },
    ];

    let created = 0;
    for (const data of exercisesData) {
      try {
        const existing = await this.exerciseRepository.findOne({
          where: { name: data.name },
        });

        if (!existing) {
          const muscleGroup = await this.muscleGroupRepository.findOne({
            where: { code: data.muscleCode },
          });

          if (muscleGroup) {
            await this.exerciseRepository.save(
              this.exerciseRepository.create({
                name: data.name,
                description: data.description,
                difficulty: data.difficulty,
                muscleGroupId: muscleGroup.id,
              })
            );
            created++;
          }
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando ejercicio ${data.name}`, error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} ejercicios creados`);
    } else {
      this.logger.log('  - Ejercicios ya existen');
    }
  }

  async seedRoutines() {
    const routinesData = [
      {
        name: 'Rutina Full Body Principiante',
        description: 'Rutina completa para comenzar a entrenar',
        difficulty: Difficulty.BEGINNER,
        estimatedDuration: 45,
        exercises: ['Sentadilla', 'Press de Banca', 'Remo con Barra', 'Plancha'],
      },
      {
        name: 'Día de Pecho y Tríceps',
        description: 'Enfoque en pectorales y tríceps',
        difficulty: Difficulty.INTERMEDIATE,
        estimatedDuration: 50,
        exercises: [
          'Press de Banca',
          'Press Inclinado con Mancuernas',
          'Aperturas con Mancuernas',
          'Fondos en Banco',
          'Extensión de Tríceps',
        ],
      },
      {
        name: 'Día de Espalda y Bíceps',
        description: 'Enfoque en dorsales y bíceps',
        difficulty: Difficulty.INTERMEDIATE,
        estimatedDuration: 50,
        exercises: [
          'Dominadas',
          'Remo con Barra',
          'Jalón al Pecho',
          'Curl con Barra',
          'Curl Martillo',
        ],
      },
      {
        name: 'Día de Piernas',
        description: 'Entrenamiento completo de tren inferior',
        difficulty: Difficulty.INTERMEDIATE,
        estimatedDuration: 55,
        exercises: ['Sentadilla', 'Prensa de Piernas', 'Zancadas', 'Curl de Piernas', 'Hip Thrust'],
      },
    ];

    let created = 0;
    for (const data of routinesData) {
      try {
        const existing = await this.routineRepository.findOne({
          where: { name: data.name },
        });

        if (!existing) {
          const routine = await this.routineRepository.save(
            this.routineRepository.create({
              name: data.name,
              description: data.description,
              difficulty: data.difficulty,
              estimatedDuration: data.estimatedDuration,
            })
          );

          // Add exercises to routine
          let order = 1;
          for (const exerciseName of data.exercises) {
            const exercise = await this.exerciseRepository.findOne({
              where: { name: exerciseName },
            });
            if (exercise) {
              await this.routineExerciseRepository.save(
                this.routineExerciseRepository.create({
                  routineId: routine.id,
                  exerciseId: exercise.id,
                  order: order++,
                  sets: 3,
                  reps: 12,
                  restSeconds: 60,
                })
              );
            }
          }
          created++;
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando rutina ${data.name}`, error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} rutinas creadas`);
    } else {
      this.logger.log('  - Rutinas ya existen');
    }
  }

  async seedUserRoutines() {
    // Asignar rutinas a user1 y user2
    const assignments = [
      {
        userEmail: 'user1@fitflow.com',
        routineName: 'Rutina Full Body Principiante',
        day: DayOfWeek.MONDAY,
      },
      {
        userEmail: 'user1@fitflow.com',
        routineName: 'Rutina Full Body Principiante',
        day: DayOfWeek.WEDNESDAY,
      },
      {
        userEmail: 'user1@fitflow.com',
        routineName: 'Rutina Full Body Principiante',
        day: DayOfWeek.FRIDAY,
      },
      {
        userEmail: 'user2@fitflow.com',
        routineName: 'Día de Pecho y Tríceps',
        day: DayOfWeek.MONDAY,
      },
      {
        userEmail: 'user2@fitflow.com',
        routineName: 'Día de Espalda y Bíceps',
        day: DayOfWeek.WEDNESDAY,
      },
      { userEmail: 'user2@fitflow.com', routineName: 'Día de Piernas', day: DayOfWeek.FRIDAY },
    ];

    let created = 0;
    for (const data of assignments) {
      try {
        const user = await this.userRepository.findOne({ where: { email: data.userEmail } });
        const routine = await this.routineRepository.findOne({ where: { name: data.routineName } });

        if (user && routine) {
          const existing = await this.userRoutineRepository.findOne({
            where: { userId: user.id, routineId: routine.id, dayOfWeek: data.day },
          });

          if (!existing) {
            await this.userRoutineRepository.save(
              this.userRoutineRepository.create({
                userId: user.id,
                routineId: routine.id,
                dayOfWeek: data.day,
                startDate: new Date(),
              })
            );
            created++;
          }
        }
      } catch (error) {
        this.logger.error(`  ✗ Error asignando rutina`, error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} rutinas asignadas a usuarios`);
    } else {
      this.logger.log('  - Asignaciones ya existen');
    }
  }

  async seedMembershipTypes() {
    const typesData = [
      {
        name: 'Mensual',
        description: 'Membresía mensual con acceso completo al gimnasio',
        price: 15000,
        durationDays: 30,
        gracePeriodDays: 5,
        accessType: AccessType.ALL_ACCESS,
        isActive: true,
      },
      {
        name: 'Trimestral',
        description: 'Membresía trimestral con 10% de descuento',
        price: 40500,
        durationDays: 90,
        gracePeriodDays: 7,
        accessType: AccessType.ALL_ACCESS,
        isActive: true,
      },
      {
        name: 'Semestral',
        description: 'Membresía semestral con 15% de descuento',
        price: 76500,
        durationDays: 180,
        gracePeriodDays: 10,
        accessType: AccessType.ALL_ACCESS,
        isActive: true,
      },
      {
        name: 'Anual',
        description: 'Membresía anual con 20% de descuento',
        price: 144000,
        durationDays: 365,
        gracePeriodDays: 15,
        accessType: AccessType.ALL_ACCESS,
        isActive: true,
      },
      {
        name: 'Pase Diario',
        description: 'Acceso por un día',
        price: 1500,
        durationDays: 1,
        gracePeriodDays: 0,
        accessType: AccessType.GYM_ONLY,
        isActive: true,
      },
      {
        name: 'Promoción Verano (Inactivo)',
        description: 'Promoción de verano - Ya no disponible',
        price: 12000,
        durationDays: 30,
        gracePeriodDays: 3,
        accessType: AccessType.ALL_ACCESS,
        isActive: false,
      },
    ];

    let created = 0;
    for (const data of typesData) {
      try {
        const existing = await this.membershipTypeRepository.findOne({
          where: { name: data.name },
        });

        if (!existing) {
          await this.membershipTypeRepository.save(this.membershipTypeRepository.create(data));
          created++;
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando tipo de membresía ${data.name}`, error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} tipos de membresía creados`);
    } else {
      this.logger.log('  - Tipos de membresía ya existen');
    }
  }

  async seedMemberships() {
    const today = new Date();

    // Helper para calcular fechas
    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const subDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };

    // Obtener usuarios y tipos de membresía
    const users = await this.userRepository.find({ where: { role: Role.USER } });
    const membershipTypes = await this.membershipTypeRepository.find({ where: { isActive: true } });

    if (users.length === 0 || membershipTypes.length === 0) {
      this.logger.log('  - No hay usuarios o tipos de membresía para crear membresías');
      return;
    }

    const monthlyType = membershipTypes.find((t) => t.name === 'Mensual');
    const quarterlyType = membershipTypes.find((t) => t.name === 'Trimestral');

    if (!monthlyType || !quarterlyType) {
      this.logger.log('  - Tipos de membresía requeridos no encontrados');
      return;
    }

    // Crear más usuarios para tener más datos
    const additionalUsers = [
      {
        email: 'user3@fitflow.com',
        password: 'User123!',
        name: 'Pedro Martínez',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user4@fitflow.com',
        password: 'User123!',
        name: 'Ana Rodríguez',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user5@fitflow.com',
        password: 'User123!',
        name: 'Luis Fernández',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user6@fitflow.com',
        password: 'User123!',
        name: 'Carmen Sánchez',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user7@fitflow.com',
        password: 'User123!',
        name: 'Diego Torres',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'user8@fitflow.com',
        password: 'User123!',
        name: 'Laura Gómez',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'moroso1@fitflow.com',
        password: 'User123!',
        name: 'Roberto Moroso',
        role: Role.USER,
        isActive: true,
      },
      {
        email: 'moroso2@fitflow.com',
        password: 'User123!',
        name: 'Patricia Vencida',
        role: Role.USER,
        isActive: true,
      },
    ];

    for (const userData of additionalUsers) {
      const existing = await this.userRepository.findOne({ where: { email: userData.email } });
      if (!existing) {
        await this.userRepository.save(this.userRepository.create(userData));
      }
    }

    const membershipsData = [
      // Membresías activas (vigentes)
      {
        userEmail: 'user1@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 15),
        endDate: addDays(today, 15),
        status: MembershipStatus.ACTIVE,
        notes: 'Membresía activa - mitad del período',
      },
      {
        userEmail: 'user2@fitflow.com',
        typeName: 'Trimestral',
        startDate: subDays(today, 30),
        endDate: addDays(today, 60),
        status: MembershipStatus.ACTIVE,
        notes: 'Membresía trimestral activa',
      },
      {
        userEmail: 'user3@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 5),
        endDate: addDays(today, 25),
        status: MembershipStatus.ACTIVE,
        notes: 'Membresía recién iniciada',
      },
      {
        userEmail: 'user4@fitflow.com',
        typeName: 'Semestral',
        startDate: subDays(today, 60),
        endDate: addDays(today, 120),
        status: MembershipStatus.ACTIVE,
        notes: 'Membresía semestral activa',
      },
      // Membresías próximas a vencer (dentro de 7 días)
      {
        userEmail: 'user5@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 27),
        endDate: addDays(today, 3),
        status: MembershipStatus.ACTIVE,
        notes: 'Vence en 3 días - Próximo a vencer',
      },
      {
        userEmail: 'user6@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 25),
        endDate: addDays(today, 5),
        status: MembershipStatus.ACTIVE,
        notes: 'Vence en 5 días - Próximo a vencer',
      },
      // Membresías vencidas (morosos)
      {
        userEmail: 'moroso1@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 45),
        endDate: subDays(today, 15),
        status: MembershipStatus.EXPIRED,
        notes: 'Membresía vencida hace 15 días - MOROSO',
      },
      {
        userEmail: 'moroso2@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 60),
        endDate: subDays(today, 30),
        status: MembershipStatus.EXPIRED,
        notes: 'Membresía vencida hace 30 días - MOROSO',
      },
      // Membresía en período de gracia
      {
        userEmail: 'user7@fitflow.com',
        typeName: 'Mensual',
        startDate: subDays(today, 32),
        endDate: subDays(today, 2),
        status: MembershipStatus.GRACE_PERIOD,
        notes: 'En período de gracia - Vencida hace 2 días',
      },
      // Membresía cancelada
      {
        userEmail: 'user8@fitflow.com',
        typeName: 'Trimestral',
        startDate: subDays(today, 30),
        endDate: addDays(today, 60),
        status: MembershipStatus.CANCELLED,
        notes: 'Membresía cancelada por el usuario',
      },
    ];

    let created = 0;
    for (const data of membershipsData) {
      try {
        const user = await this.userRepository.findOne({ where: { email: data.userEmail } });
        const membershipType = await this.membershipTypeRepository.findOne({
          where: { name: data.typeName },
        });

        if (user && membershipType) {
          const existing = await this.membershipRepository.findOne({
            where: { userId: user.id, membershipTypeId: membershipType.id },
          });

          if (!existing) {
            await this.membershipRepository.save(
              this.membershipRepository.create({
                userId: user.id,
                membershipTypeId: membershipType.id,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status,
                notes: data.notes,
              })
            );
            created++;
          }
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando membresía para ${data.userEmail}`, error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} membresías creadas`);
    } else {
      this.logger.log('  - Membresías ya existen');
    }
  }

  async seedPayments() {
    const today = new Date();
    const admin = await this.userRepository.findOne({ where: { email: 'admin@fitflow.com' } });

    const subMonths = (date: Date, months: number): Date => {
      const result = new Date(date);
      result.setMonth(result.getMonth() - months);
      return result;
    };

    // Obtener membresías activas y vencidas para crear pagos
    const memberships = await this.membershipRepository.find({
      relations: ['user', 'membershipType'],
    });

    if (memberships.length === 0) {
      this.logger.log('  - No hay membresías para crear pagos');
      return;
    }

    const paymentsData: Array<{
      membershipId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      paymentDate: Date;
      coverageStart: Date;
      coverageEnd: Date;
      reference: string | null;
      notes: string | null;
    }> = [];

    // Crear pagos para cada membresía activa
    for (const membership of memberships) {
      if (
        membership.status === MembershipStatus.ACTIVE ||
        membership.status === MembershipStatus.GRACE_PERIOD
      ) {
        // Pago actual de la membresía
        paymentsData.push({
          membershipId: membership.id,
          amount: Number(membership.membershipType.price),
          paymentMethod: this.getRandomPaymentMethod(),
          paymentDate: membership.startDate,
          coverageStart: membership.startDate,
          coverageEnd: membership.endDate,
          reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          notes: `Pago de membresía ${membership.membershipType.name}`,
        });
      }
    }

    // Crear pagos históricos (últimos 6 meses) para simular historial
    const historicalPayments = [
      { monthsAgo: 1, amount: 15000, method: PaymentMethod.CASH },
      { monthsAgo: 1, amount: 15000, method: PaymentMethod.CARD },
      { monthsAgo: 1, amount: 40500, method: PaymentMethod.TRANSFER },
      { monthsAgo: 2, amount: 15000, method: PaymentMethod.CASH },
      { monthsAgo: 2, amount: 15000, method: PaymentMethod.CASH },
      { monthsAgo: 2, amount: 15000, method: PaymentMethod.CARD },
      { monthsAgo: 3, amount: 15000, method: PaymentMethod.TRANSFER },
      { monthsAgo: 3, amount: 40500, method: PaymentMethod.CARD },
      { monthsAgo: 3, amount: 15000, method: PaymentMethod.CASH },
      { monthsAgo: 4, amount: 15000, method: PaymentMethod.CASH },
      { monthsAgo: 4, amount: 15000, method: PaymentMethod.CARD },
      { monthsAgo: 5, amount: 15000, method: PaymentMethod.TRANSFER },
      { monthsAgo: 5, amount: 40500, method: PaymentMethod.CASH },
      { monthsAgo: 6, amount: 15000, method: PaymentMethod.CARD },
      { monthsAgo: 6, amount: 15000, method: PaymentMethod.CASH },
    ];

    // Usar la primera membresía activa para pagos históricos
    const activeMembership = memberships.find((m) => m.status === MembershipStatus.ACTIVE);
    if (activeMembership) {
      for (const hp of historicalPayments) {
        paymentsData.push({
          membershipId: activeMembership.id,
          amount: hp.amount,
          paymentMethod: hp.method,
          paymentDate: subMonths(today, hp.monthsAgo),
          coverageStart: activeMembership.startDate,
          coverageEnd: activeMembership.endDate,
          reference: `HIST-${hp.monthsAgo}M-${Math.random().toString(36).substr(2, 6)}`,
          notes: `Pago histórico - ${hp.monthsAgo} mes(es) atrás`,
        });
      }
    }

    let created = 0;
    for (const data of paymentsData) {
      try {
        // Verificar si ya existe un pago similar
        const existing = await this.paymentRepository.findOne({
          where: {
            membershipId: data.membershipId,
            paymentDate: data.paymentDate,
            amount: data.amount,
          },
        });

        if (!existing) {
          await this.paymentRepository.save(
            this.paymentRepository.create({
              ...data,
              registeredById: admin?.id || null,
            })
          );
          created++;
        }
      } catch (error) {
        this.logger.error(`  ✗ Error creando pago`, error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} pagos creados`);
    } else {
      this.logger.log('  - Pagos ya existen');
    }
  }

  private getRandomPaymentMethod(): PaymentMethod {
    const methods = [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.TRANSFER];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  async seedAccessLogs() {
    const today = new Date();
    const trainer = await this.userRepository.findOne({ where: { email: 'trainer@fitflow.com' } });
    const users = await this.userRepository.find({ where: { role: Role.USER, isActive: true } });

    if (users.length === 0 || !trainer) {
      this.logger.log('  - No hay usuarios o trainer para crear logs de acceso');
      return;
    }

    const subDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };

    const setTime = (date: Date, hours: number, minutes: number): Date => {
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };

    const accessLogsData: Array<{
      userId: string;
      scannedById: string;
      granted: boolean;
      reason: string;
      createdAt: Date;
    }> = [];

    // Generar accesos para los últimos 60 días
    for (let daysAgo = 0; daysAgo < 60; daysAgo++) {
      const date = subDays(today, daysAgo);
      const dayOfWeek = date.getDay();

      // Menos accesos los fines de semana
      const accessCount = dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 5;

      for (let i = 0; i < accessCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const hour = 6 + Math.floor(Math.random() * 14); // Entre 6am y 8pm
        const minute = Math.floor(Math.random() * 60);

        // 90% de accesos exitosos
        const granted = Math.random() > 0.1;

        accessLogsData.push({
          userId: user.id,
          scannedById: trainer.id,
          granted,
          reason: granted ? 'Acceso permitido' : 'Membresía vencida',
          createdAt: setTime(date, hour, minute),
        });
      }
    }

    // Verificar si ya hay logs
    const existingCount = await this.accessLogRepository.count();
    if (existingCount > 0) {
      this.logger.log(`  - Ya existen ${existingCount} logs de acceso`);
      return;
    }

    let created = 0;
    for (const data of accessLogsData) {
      try {
        await this.accessLogRepository.save(this.accessLogRepository.create(data));
        created++;
      } catch (error) {
        this.logger.error('  ✗ Error creando log de acceso', error);
      }
    }

    if (created > 0) {
      this.logger.log(`  ✓ ${created} logs de acceso creados`);
    }
  }
}
