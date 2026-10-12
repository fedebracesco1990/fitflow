import { TrainerStudentSummaryDto } from './trainer-student-summary.dto';

export class TrainerDashboardDto {
  role: 'trainer';

  // My students' KPIs
  totalAlumnos: number;
  alumnosActivos: number;

  // Workout KPIs
  rutinasActivasCreadas: number;
  prsAlumnosMes: number;

  // Summary list of recent students
  alumnosRecientes: TrainerStudentSummaryDto[];
}
