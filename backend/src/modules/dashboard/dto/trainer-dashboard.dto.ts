import { TrainerStudentSummaryDto } from './trainer-student-summary.dto';

export class TrainerDashboardDto {
  role: 'trainer';

  // KPIs de mis alumnos
  totalAlumnos: number;
  alumnosActivos: number;

  // KPIs entrenamientos
  rutinasActivasCreadas: number;
  prsAlumnosMes: number;

  // Lista resumen de alumnos recientes
  alumnosRecientes: TrainerStudentSummaryDto[];
}
