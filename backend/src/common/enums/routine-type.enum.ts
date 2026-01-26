export enum RoutineType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export const RoutineTypeLabels: Record<RoutineType, string> = {
  [RoutineType.DAILY]: 'Rutina Diaria',
  [RoutineType.WEEKLY]: 'Programa Semanal',
};
