# Análisis de Entidades - Módulo de Rutinas

## 🎯 Casos de Uso del Usuario

### ¿Qué necesita hacer un USUARIO (cliente del gimnasio)?

| # | Caso de Uso | Descripción |
|---|-------------|-------------|
| U1 | Ver mi rutina del día | Ver qué ejercicios debo hacer hoy |
| U2 | Ver mi semana completa | Ver qué días tengo rutinas asignadas |
| U3 | Ejecutar rutina | Marcar series, registrar peso/reps |
| U4 | Ver historial | Ver entrenamientos pasados completados |
| U5 | Ver progreso | Ver si subí de peso en ejercicios |

### ¿Qué necesita hacer un ADMIN/ENTRENADOR?

| # | Caso de Uso | Descripción |
|---|-------------|-------------|
| A1 | Crear ejercicios | Definir ejercicios con descripción, video, etc. |
| A2 | Crear rutina | Agrupar ejercicios con sets/reps |
| A3 | Crear programa semanal | Definir qué rutina va cada día de la semana |
| A4 | Asignar programa a usuario | Decir "Juan hace el programa Fuerza" |
| A5 | Ver progreso de usuarios | Ver cómo van los clientes |

---

## 🔍 Entidades Actuales vs Necesidades

### Entidades ACTUALES relacionadas con rutinas:

```
1. Exercise           - Ejercicio individual
2. MuscleGroup        - Grupo muscular
3. Routine            - Rutina (también usada como Programa)
4. RoutineExercise    - Ejercicio dentro de rutina
5. ProgramRoutine     - Rutina dentro de un programa (día X)
6. ProgramRoutineExercise - Ejercicio personalizado en programa
7. UserRoutine        - Rutina asignada a usuario (por día)
8. UserProgram        - Programa asignado a usuario
9. WorkoutLog         - Registro de entrenamiento
10. ExerciseLog       - Registro de serie ejecutada
11. PersonalRecord    - Récord personal
```

### 🚨 Problemas Identificados:

#### 1. **Routine hace doble función**
- `Routine` con `type: DAILY` = rutina normal
- `Routine` con `type: WEEKLY` = programa semanal

**Problema**: Confusión semántica. Un "programa" no es una "rutina".

#### 2. **Doble forma de asignar rutinas**
- `UserRoutine` - Asigna rutina a usuario por día de semana
- `UserProgram` + `ProgramRoutine` - Asigna programa completo

**Problema**: ¿Cuál usar? ¿Por qué dos caminos?

#### 3. **ProgramRoutineExercise - ¿Es necesaria?**
- Permite personalizar ejercicios por usuario en un programa
- Pero `RoutineExercise` ya define los ejercicios de la rutina

**Pregunta**: ¿Realmente se personalizan ejercicios por programa?

#### 4. **WorkoutLog tiene 3 FKs opcionales**
- `userRoutineId` - Si viene de UserRoutine
- `userProgramId` - Si viene de UserProgram  
- `programRoutineId` - Referencia a la rutina del día

**Problema**: Complejidad innecesaria en queries.

---

## 💡 Propuesta: Modelo Simplificado

### Opción A: Un solo camino de asignación

```
Usuario necesita:
1. Tener un PROGRAMA asignado (su plan semanal)
2. El programa define qué RUTINA hace cada día
3. Al entrenar, se crea un LOG

Entidades necesarias:
- Exercise
- Routine (solo rutinas, NO programas)
- RoutineExercise
- Program (NUEVA - programa semanal)
- ProgramDay (rutina por día en programa)
- UserProgram (programa asignado a usuario)
- WorkoutLog (solo referencia a UserProgram + día)
- ExerciseLog
```

### Opción B: Mantener estructura pero clarificar

Mantener `Routine` para todo pero:
- Eliminar `UserRoutine` (usar solo `UserProgram`)
- Eliminar `ProgramRoutineExercise` (usar ejercicios de la rutina base)
- Simplificar `WorkoutLog` a solo `userProgramId` + `programRoutineId`

---

## ❓ Preguntas para decidir

1. **¿Un usuario puede tener rutinas sueltas (sin programa)?**
   - Si NO → Eliminar `UserRoutine`
   - Si SÍ → Mantener ambos caminos

2. **¿Se personalizan ejercicios por usuario en un programa?**
   - Si NO → Eliminar `ProgramRoutineExercise`
   - Si SÍ → Mantener

3. **¿Un programa siempre es semanal (7 días)?**
   - Si SÍ → Simplificar a días fijos
   - Si NO → Mantener `dayNumber` flexible

4. **¿Qué pasa si el admin cambia un programa ya asignado?**
   - ¿Se actualiza para todos los usuarios?
   - ¿Se mantiene la versión que tenían?

---

## 📊 Resumen Visual

### Modelo ACTUAL (complejo):
```
Routine ─┬─► RoutineExercise ─► Exercise
         │
         ├─► ProgramRoutine ─► ProgramRoutineExercise ─► Exercise
         │         │
         │         ▼
         │    UserProgram ─► WorkoutLog
         │
         └─► UserRoutine ─────► WorkoutLog
```

### Modelo PROPUESTO (simple):
```
Routine ─► RoutineExercise ─► Exercise
    │
    ▼
ProgramRoutine (día en programa)
    │
    ▼
UserProgram (programa del usuario)
    │
    ▼
WorkoutLog ─► ExerciseLog
```

---

**¿Qué opinas? ¿Puedes confirmar las respuestas a las preguntas?**
