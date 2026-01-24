import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PdfPrinter = require('pdfmake');
import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import {
  IReportGenerator,
  FinancialReportData,
  AttendanceReportData,
  UsersReportData,
} from '../interfaces/report-generator.interface';
import { formatDate } from '../utils/date.utils';

@Injectable()
export class PdfReportGenerator implements IReportGenerator {
  private printer: PdfPrinter;

  constructor() {
    const fonts = {
      Roboto: {
        normal: 'node_modules/pdfmake/build/vfs_fonts.js',
        bold: 'node_modules/pdfmake/build/vfs_fonts.js',
        italics: 'node_modules/pdfmake/build/vfs_fonts.js',
        bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js',
      },
    };
    this.printer = new PdfPrinter(fonts);
  }

  private createHeader(title: string, period?: { startDate?: Date; endDate?: Date }): Content[] {
    const header: Content[] = [
      { text: 'FitFlow', style: 'brand', alignment: 'center' },
      { text: title, style: 'header', alignment: 'center' },
      { text: `Generado: ${formatDate(new Date())}`, style: 'subheader', alignment: 'center' },
    ];

    if (period?.startDate || period?.endDate) {
      const periodText = `Período: ${period.startDate ? formatDate(new Date(period.startDate)) : 'Inicio'} - ${period.endDate ? formatDate(new Date(period.endDate)) : 'Actual'}`;
      header.push({ text: periodText, style: 'subheader', alignment: 'center' });
    }

    header.push({ text: '', margin: [0, 10, 0, 10] });
    return header;
  }

  private getDefaultStyles(): TDocumentDefinitions['styles'] {
    return {
      brand: { fontSize: 20, bold: true, color: '#4472C4', margin: [0, 0, 0, 5] },
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 5] },
      subheader: { fontSize: 10, color: '#666666', margin: [0, 0, 0, 3] },
      sectionTitle: { fontSize: 14, bold: true, margin: [0, 15, 0, 10], color: '#333333' },
      tableHeader: { fontSize: 10, bold: true, fillColor: '#4472C4', color: '#FFFFFF' },
      tableCell: { fontSize: 9 },
      summaryLabel: { fontSize: 11, bold: true },
      summaryValue: { fontSize: 11 },
    };
  }

  private createTable(headers: string[], rows: TableCell[][]): Content {
    return {
      table: {
        headerRows: 1,
        widths: headers.map(() => '*'),
        body: [
          headers.map((h) => ({ text: h, style: 'tableHeader' })),
          ...rows.map((row) => row.map((cell) => ({ text: String(cell), style: 'tableCell' }))),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#CCCCCC',
        vLineColor: () => '#CCCCCC',
        fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? null : '#F5F5F5'),
      },
    };
  }

  private generatePdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }

  async generateFinancialReport(data: FinancialReportData): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      content: [
        ...this.createHeader(data.title, data.period),
        { text: 'Resumen', style: 'sectionTitle' },
        {
          columns: [
            { text: 'Total Recaudado:', style: 'summaryLabel', width: 150 },
            { text: `$${data.data.totalRevenue.toFixed(2)}`, style: 'summaryValue' },
          ],
        },
        {
          columns: [
            { text: 'Cantidad de Pagos:', style: 'summaryLabel', width: 150 },
            { text: String(data.data.paymentCount), style: 'summaryValue' },
          ],
        },
        { text: 'Detalle de Pagos', style: 'sectionTitle' },
        this.createTable(
          ['Fecha', 'Usuario', 'Monto', 'Método', 'Tipo Membresía'],
          data.data.payments
            .slice(0, 50)
            .map((p) => [p.date, p.userName, `$${p.amount.toFixed(2)}`, p.method, p.membershipType])
        ),
        { text: 'Resumen por Método de Pago', style: 'sectionTitle' },
        this.createTable(
          ['Método', 'Total', 'Cantidad'],
          data.data.summaryByMethod.map((m) => [
            m.method,
            `$${m.total.toFixed(2)}`,
            String(m.count),
          ])
        ),
      ],
      styles: this.getDefaultStyles(),
      defaultStyle: { font: 'Roboto' },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
    };

    return this.generatePdf(docDefinition);
  }

  async generateAttendanceReport(data: AttendanceReportData): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      content: [
        ...this.createHeader(data.title, data.period),
        { text: 'Resumen', style: 'sectionTitle' },
        {
          columns: [
            { text: 'Total Asistencias:', style: 'summaryLabel', width: 150 },
            { text: String(data.data.totalAttendances), style: 'summaryValue' },
          ],
        },
        {
          columns: [
            { text: 'Usuarios Únicos:', style: 'summaryLabel', width: 150 },
            { text: String(data.data.uniqueUsers), style: 'summaryValue' },
          ],
        },
        { text: 'Asistencias por Día de Semana', style: 'sectionTitle' },
        this.createTable(
          ['Día', 'Cantidad'],
          data.data.byDayOfWeek.map((d) => [d.day, String(d.count)])
        ),
        { text: 'Promedios Mensuales', style: 'sectionTitle' },
        this.createTable(
          ['Mes', 'Promedio'],
          data.data.monthlyAverages.map((m) => [m.month, m.average.toFixed(1)])
        ),
        { text: 'Detalle de Asistencias (últimas 50)', style: 'sectionTitle' },
        this.createTable(
          ['Fecha', 'Usuario', 'Hora Entrada'],
          data.data.attendances.slice(0, 50).map((a) => [a.date, a.userName, a.checkInTime])
        ),
      ],
      styles: this.getDefaultStyles(),
      defaultStyle: { font: 'Roboto' },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
    };

    return this.generatePdf(docDefinition);
  }

  async generateUsersReport(data: UsersReportData): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      content: [
        ...this.createHeader(data.title, data.period),
        { text: 'Resumen', style: 'sectionTitle' },
        {
          columns: [
            { text: 'Total Usuarios:', style: 'summaryLabel', width: 150 },
            { text: String(data.data.totalUsers), style: 'summaryValue' },
          ],
        },
        {
          columns: [
            { text: 'Usuarios Activos:', style: 'summaryLabel', width: 150 },
            { text: String(data.data.activeUsers), style: 'summaryValue' },
          ],
        },
        { text: 'Distribución por Tipo de Membresía', style: 'sectionTitle' },
        this.createTable(
          ['Tipo', 'Cantidad'],
          data.data.summaryByMembershipType.map((t) => [t.type, String(t.count)])
        ),
        { text: 'Listado de Usuarios', style: 'sectionTitle' },
        this.createTable(
          ['Nombre', 'Email', 'Membresía', 'Estado', 'Vencimiento'],
          data.data.users
            .slice(0, 100)
            .map((u) => [
              u.name,
              u.email,
              u.membershipType,
              u.membershipStatus,
              u.membershipEndDate,
            ])
        ),
      ],
      styles: this.getDefaultStyles(),
      defaultStyle: { font: 'Roboto' },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
    };

    return this.generatePdf(docDefinition);
  }
}
