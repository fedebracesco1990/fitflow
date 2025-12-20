export class TransactionItemDto {
  fecha: Date;
  monto: number;
  metodo: string;
  miembro?: string;
}

export class FinancialReportDto {
  ingresoTotal: number;
  transacciones: number;
  morososActuales: number;
  desglose: TransactionItemDto[];
}
