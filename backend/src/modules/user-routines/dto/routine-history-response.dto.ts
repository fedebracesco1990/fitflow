export class RoutineHistoryItemDto {
  id: string;
  routineId: string;
  routineName: string;
  routineDescription: string | null;
  dayOfWeek: string;
  startDate: string;
  endDate: string | null;
  durationDays: number | null;
  workoutsCompleted: number;
}

export class RoutineHistoryResponseDto {
  userId: string;
  totalRoutines: number;
  history: RoutineHistoryItemDto[];
}
