export interface TransactionItem {
  fecha: Date;
  monto: number;
  metodo: string;
  miembro?: string;
}

export interface FinancialReport {
  ingresoTotal: number;
  transacciones: number;
  morososActuales: number;
  desglose: TransactionItem[];
}
