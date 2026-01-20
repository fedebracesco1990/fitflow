export class TrainerStudentSummaryDto {
  userId: string;
  userName: string;
  userEmail: string;
  rutinasAsignadas: number;
  ultimaActividad: Date | null;
  tieneRutinaActiva: boolean;
}
