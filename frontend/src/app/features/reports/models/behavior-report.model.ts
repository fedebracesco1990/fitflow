export interface MemberAnalysis {
  userId: string;
  miembro: string;
  email: string;
  estado: 'ACTIVE' | 'OVERDUE' | 'INACTIVE';
  visitasTotales: number;
  rutinaActiva: boolean;
  membershipEndDate?: Date;
}

export interface BehaviorReport {
  visitasPromActivos: number;
  visitasPromMorosos: number;
  rutinasActivas: number;
  analisis: MemberAnalysis[];
  totalMembers: number;
}
