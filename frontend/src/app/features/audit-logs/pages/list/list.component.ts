import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { AuditLogsService } from '../../../../core/services';
import { AuditAction, AuditActionLabels, AuditLog } from '../../../../core/models';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-audit-logs-list',
  standalone: true,
  imports: [DatePipe, NgClass, AlertComponent, ButtonComponent, CardComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AuditLogsListComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);

  readonly logs = signal<AuditLog[]>([]);
  readonly paginationMeta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly selectedEntity = signal<string>('');
  readonly selectedAction = signal<AuditAction | ''>('');

  readonly AuditActionLabels = AuditActionLabels;
  readonly AuditAction = AuditAction;

  readonly entityOptions = ['Payment', 'Membership', 'User', 'MembershipType'];
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
    this.loading.set(true);
    this.error.set(null);

    this.auditLogsService
      .getAll({
        page,
        limit: 50,
        entity: this.selectedEntity() || undefined,
        action: (this.selectedAction() as AuditAction) || undefined,
      })
      .subscribe({
        next: (response) => {
          this.logs.set(response.data);
          this.paginationMeta.set(response.meta);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al cargar los logs');
          this.loading.set(false);
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
    if (meta && meta.page < meta.totalPages) {
      this.loadLogs(meta.page + 1);
    }
  }

  prevPage(): void {
    const meta = this.paginationMeta();
    if (meta && meta.page > 1) {
      this.loadLogs(meta.page - 1);
    }
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

  formatDetails(log: AuditLog): string {
    if (!log.details) return '-';
    return JSON.stringify(log.details, null, 2);
  }
}
