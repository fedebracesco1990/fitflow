export class MemberAnalysisDto {
  userId: string;
  miembro: string;
  email: string;
  estado: 'ACTIVE' | 'OVERDUE' | 'INACTIVE';
  visitasTotales: number;
  rutinaActiva: boolean;
  membershipEndDate?: Date;
}

export class BehaviorReportDto {
  visitasPromActivos: number;
  visitasPromMorosos: number;
  rutinasActivas: number;
  analisis: MemberAnalysisDto[];
  totalMembers: number;
}
