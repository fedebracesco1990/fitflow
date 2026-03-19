import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { AuditLogsService } from '../../../../core/services';
import { AuditAction, AuditActionLabels, AuditLog } from '../../../../core/models';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import { ButtonComponent, LoadingSpinnerComponent } from '../../../../shared';

const ENTITY_LABELS: Record<string, string> = {
  Payment: 'Pagos',
  Membership: 'Membresías',
  User: 'Directorio',
  MembershipType: 'Tipos',
};

@Component({
  selector: 'fit-flow-audit-logs-widget',
  standalone: true,
  imports: [DatePipe, NgClass, RouterLink, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './audit-logs-widget.component.html',
  styleUrl: './audit-logs-widget.component.scss',
})
export class AuditLogsWidgetComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);

  readonly logs = signal<AuditLog[]>([]);
  readonly paginationMeta = signal<PaginationMeta | null>(null);
  readonly isLoading = signal(true);
  readonly selectedEntity = signal<string>('');
  readonly selectedAction = signal<AuditAction | ''>('');

  readonly AuditActionLabels = AuditActionLabels;
  readonly AuditAction = AuditAction;
  readonly ENTITY_LABELS = ENTITY_LABELS;

  readonly entityOptions = Object.entries(ENTITY_LABELS);
  readonly actionOptions: { value: AuditAction | ''; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: AuditAction.CREATE, label: 'Creación' },
    { value: AuditAction.UPDATE, label: 'Modificación' },
    { value: AuditAction.DELETE, label: 'Eliminación' },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page = 1): void {
    this.isLoading.set(true);
    this.auditLogsService
      .getAll({
        page,
        limit: 20,
        entity: this.selectedEntity() || undefined,
        action: (this.selectedAction() as AuditAction) || undefined,
      })
      .subscribe({
        next: (response) => {
          this.logs.set(response.data);
          this.paginationMeta.set(response.meta);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onEntityChange(event: Event): void {
    this.selectedEntity.set((event.target as HTMLSelectElement).value);
    this.loadLogs();
  }

  onActionChange(event: Event): void {
    this.selectedAction.set((event.target as HTMLSelectElement).value as AuditAction | '');
    this.loadLogs();
  }

  nextPage(): void {
    const meta = this.paginationMeta();
    if (meta && meta.page < meta.totalPages) this.loadLogs(meta.page + 1);
  }

  prevPage(): void {
    const meta = this.paginationMeta();
    if (meta && meta.page > 1) this.loadLogs(meta.page - 1);
  }

  getActionClass(action: AuditAction): string {
    const map: Record<AuditAction, string> = {
      [AuditAction.CREATE]: 'badge-create',
      [AuditAction.UPDATE]: 'badge-update',
      [AuditAction.DELETE]: 'badge-delete',
    };
    return map[action] ?? '';
  }

  getPerformedByName(log: AuditLog): string {
    return log.performedBy?.email ?? log.performedById ?? 'Sistema';
  }

  getEntityLabel(entity: string): string {
    return ENTITY_LABELS[entity] ?? entity;
  }

  formatDetailsAsText(log: AuditLog): string {
    if (!log.details) return '-';
    return this.buildLines(log.details).join('\n');
  }

  private readonly FIELD_LABELS: Record<string, string> = {
    amount: 'Monto',
    paymentDate: 'Fecha',
    paymentMethod: 'Método de pago',
    notes: 'Notas',
    source: 'Origen',
    before: 'Antes',
    after: 'Después',
  };

  private readonly PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    other: 'Otro',
  };

  private readonly SKIP_KEYS = new Set(['membershipId', 'entityId']);

  private buildLines(obj: Record<string, unknown>, indent = ''): string[] {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (this.SKIP_KEYS.has(key)) continue;
      const label = this.FIELD_LABELS[key] ?? key;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${indent}${label}:`);
        lines.push(...this.buildLines(value as Record<string, unknown>, indent + '  '));
      } else {
        lines.push(`${indent}${label}: ${this.formatValue(key, value)}`);
      }
    }
    return lines;
  }

  private formatValue(key: string, value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (key === 'amount') return `$${value}`;
    if (key === 'paymentMethod')
      return this.PAYMENT_METHOD_LABELS[value as string] ?? String(value);
    if (key === 'paymentDate' && typeof value === 'string') {
      const d = new Date(value);
      return isNaN(d.getTime())
        ? value
        : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return String(value);
  }
}
