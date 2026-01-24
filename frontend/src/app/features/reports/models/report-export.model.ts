export enum ReportType {
  FINANCIAL = 'financial',
  ATTENDANCE = 'attendance',
  USERS = 'users',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export interface ExportReportRequest {
  type: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
}

export interface ReportHistoryItem {
  id: string;
  type: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  generatedAt: string;
  filename: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.FINANCIAL]: 'Financiero',
  [ReportType.ATTENDANCE]: 'Asistencia',
  [ReportType.USERS]: 'Usuarios',
};

export const REPORT_FORMAT_LABELS: Record<ReportFormat, string> = {
  [ReportFormat.PDF]: 'PDF',
  [ReportFormat.EXCEL]: 'Excel',
};

export const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  [ReportType.FINANCIAL]: 'Pagos, ingresos totales y métodos de pago',
  [ReportType.ATTENDANCE]: 'Registros de asistencia por día y mes',
  [ReportType.USERS]: 'Lista de usuarios con membresías y estados',
};
