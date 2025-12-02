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
import { Role } from '../../common/enums/role.enum';
import { Difficulty } from '../../common/enums/difficulty.enum';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

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
    private readonly userRoutineRepository: Repository<UserRoutine>
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('🌱 Iniciando seed de datos...');

    await this.seedUsers();
    await this.seedMuscleGroups();
    await this.seedExercises();
    await this.seedRoutines();
    await this.seedUserRoutines();

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
}
