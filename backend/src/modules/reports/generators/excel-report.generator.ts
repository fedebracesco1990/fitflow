import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  IReportGenerator,
  FinancialReportData,
  AttendanceReportData,
  UsersReportData,
} from '../interfaces/report-generator.interface';
import { formatDate } from '../utils/date.utils';

@Injectable()
export class ExcelReportGenerator implements IReportGenerator {
  private addHeaderStyle(worksheet: ExcelJS.Worksheet): void {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private addTitleSheet(
    workbook: ExcelJS.Workbook,
    title: string,
    period?: { startDate?: Date; endDate?: Date }
  ): void {
    const infoSheet = workbook.addWorksheet('Información');
    infoSheet.columns = [
      { header: 'Campo', key: 'field', width: 25 },
      { header: 'Valor', key: 'value', width: 40 },
    ];

    infoSheet.addRow({ field: 'Reporte', value: title });
    infoSheet.addRow({ field: 'Generado', value: formatDate(new Date()) });

    if (period?.startDate) {
      infoSheet.addRow({
        field: 'Fecha Inicio',
        value: formatDate(new Date(period.startDate)),
      });
    }
    if (period?.endDate) {
      infoSheet.addRow({ field: 'Fecha Fin', value: formatDate(new Date(period.endDate)) });
    }

    this.addHeaderStyle(infoSheet);
  }

  async generateFinancialReport(data: FinancialReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    this.addTitleSheet(workbook, data.title, data.period);

    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];
    summarySheet.addRow({
      metric: 'Total Recaudado',
      value: `$${data.data.totalRevenue.toFixed(2)}`,
    });
    summarySheet.addRow({ metric: 'Cantidad de Pagos', value: data.data.paymentCount });
    this.addHeaderStyle(summarySheet);

    const paymentsSheet = workbook.addWorksheet('Pagos');
    paymentsSheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Usuario', key: 'userName', width: 30 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Método', key: 'method', width: 20 },
      { header: 'Tipo Membresía', key: 'membershipType', width: 25 },
    ];
    data.data.payments.forEach((payment) => {
      paymentsSheet.addRow({
        ...payment,
        amount: `$${payment.amount.toFixed(2)}`,
      });
    });
    this.addHeaderStyle(paymentsSheet);

    const methodSheet = workbook.addWorksheet('Por Método de Pago');
    methodSheet.columns = [
      { header: 'Método', key: 'method', width: 25 },
      { header: 'Total', key: 'total', width: 20 },
      { header: 'Cantidad', key: 'count', width: 15 },
    ];
    data.data.summaryByMethod.forEach((item) => {
      methodSheet.addRow({
        ...item,
        total: `$${item.total.toFixed(2)}`,
      });
    });
    this.addHeaderStyle(methodSheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateAttendanceReport(data: AttendanceReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    this.addTitleSheet(workbook, data.title, data.period);

    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];
    summarySheet.addRow({ metric: 'Total Asistencias', value: data.data.totalAttendances });
    summarySheet.addRow({ metric: 'Usuarios Únicos', value: data.data.uniqueUsers });
    this.addHeaderStyle(summarySheet);

    const attendanceSheet = workbook.addWorksheet('Asistencias');
    attendanceSheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Usuario', key: 'userName', width: 30 },
      { header: 'Hora Entrada', key: 'checkInTime', width: 15 },
    ];
    data.data.attendances.forEach((attendance) => {
      attendanceSheet.addRow(attendance);
    });
    this.addHeaderStyle(attendanceSheet);

    const dayOfWeekSheet = workbook.addWorksheet('Por Día de Semana');
    dayOfWeekSheet.columns = [
      { header: 'Día', key: 'day', width: 20 },
      { header: 'Cantidad', key: 'count', width: 15 },
    ];
    data.data.byDayOfWeek.forEach((item) => {
      dayOfWeekSheet.addRow(item);
    });
    this.addHeaderStyle(dayOfWeekSheet);

    const monthlySheet = workbook.addWorksheet('Promedios Mensuales');
    monthlySheet.columns = [
      { header: 'Mes', key: 'month', width: 20 },
      { header: 'Promedio', key: 'average', width: 15 },
    ];
    data.data.monthlyAverages.forEach((item) => {
      monthlySheet.addRow({
        ...item,
        average: item.average.toFixed(1),
      });
    });
    this.addHeaderStyle(monthlySheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateUsersReport(data: UsersReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    this.addTitleSheet(workbook, data.title, data.period);

    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];
    summarySheet.addRow({ metric: 'Total Usuarios', value: data.data.totalUsers });
    summarySheet.addRow({ metric: 'Usuarios Activos', value: data.data.activeUsers });
    this.addHeaderStyle(summarySheet);

    const usersSheet = workbook.addWorksheet('Usuarios');
    usersSheet.columns = [
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Tipo Membresía', key: 'membershipType', width: 25 },
      { header: 'Estado', key: 'membershipStatus', width: 20 },
      { header: 'Vencimiento', key: 'membershipEndDate', width: 15 },
    ];
    data.data.users.forEach((user) => {
      usersSheet.addRow(user);
    });
    this.addHeaderStyle(usersSheet);

    const typeSheet = workbook.addWorksheet('Por Tipo de Membresía');
    typeSheet.columns = [
      { header: 'Tipo', key: 'type', width: 30 },
      { header: 'Cantidad', key: 'count', width: 15 },
    ];
    data.data.summaryByMembershipType.forEach((item) => {
      typeSheet.addRow(item);
    });
    this.addHeaderStyle(typeSheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
