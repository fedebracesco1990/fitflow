import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccessService, AccessLog, AccessLogsParams } from '../../services/access.service';
import {
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
  BadgeComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-access-logs',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, LoadingSpinnerComponent, BadgeComponent],
  templateUrl: './access-logs.component.html',
  styleUrl: './access-logs.component.scss',
})
export class AccessLogsComponent implements OnInit {
  private readonly accessService = inject(AccessService);

  readonly isLoading = signal(true);
  readonly logs = signal<AccessLog[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page = 1): void {
    this.isLoading.set(true);
    const params: AccessLogsParams = { page, limit: 20 };

    this.accessService.getAccessLogs(params).subscribe({
      next: (response) => {
        this.logs.set(response.data);
        this.currentPage.set(response.meta.page);
        this.totalPages.set(response.meta.totalPages);
        this.total.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.loadLogs(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.loadLogs(this.currentPage() - 1);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getBadgeVariant(granted: boolean): 'success' | 'error' {
    return granted ? 'success' : 'error';
  }
}
