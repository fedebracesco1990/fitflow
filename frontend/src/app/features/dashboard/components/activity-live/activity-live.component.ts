import { Component, OnInit, inject, signal, input, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { AccessService, AccessLog } from '../../../access/services/access.service';
import { ButtonComponent, BadgeComponent, LoadingSpinnerComponent } from '../../../../shared';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-activity-live',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, LoadingSpinnerComponent, LucideAngularModule],
  templateUrl: './activity-live.component.html',
  styleUrl: './activity-live.component.scss',
})
export class ActivityLiveComponent implements OnInit {
  private readonly accessService = inject(AccessService);
  private readonly destroyRef = inject(DestroyRef);

  readonly limit = input<number>(25);
  readonly refreshInterval = input<number>(30000);

  readonly logs = signal<AccessLog[]>([]);
  readonly isLoading = signal(true);
  readonly isRefreshing = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly lastUpdated = signal<Date | null>(null);

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    interval(this.refreshInterval())
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.logs().length > 0) {
            this.isRefreshing.set(true);
          } else {
            this.isLoading.set(true);
          }
          return this.accessService.getAccessLogs(this.buildParams());
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: () => this.isLoading.set(false),
      });
  }

  private buildParams(): {
    fromDate: string;
    toDate: string;
    granted: boolean;
    page: number;
    limit: number;
  } {
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const toDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    ).toISOString();

    return {
      fromDate,
      toDate,
      granted: true,
      page: this.currentPage(),
      limit: this.limit(),
    };
  }

  refresh(): void {
    this.loadLogs();
  }

  loadLogs(page = 1): void {
    this.currentPage.set(page);
    if (this.logs().length > 0) {
      this.isRefreshing.set(true);
    } else {
      this.isLoading.set(true);
    }

    this.accessService.getAccessLogs(this.buildParams()).subscribe({
      next: (response) => this.handleResponse(response),
      error: () => this.isLoading.set(false),
    });
  }

  private handleResponse(response: {
    data: AccessLog[];
    meta: { page: number; totalPages: number; total: number };
  }): void {
    this.logs.set(response.data);
    this.currentPage.set(response.meta.page);
    this.totalPages.set(response.meta.totalPages);
    this.total.set(response.meta.total);
    this.lastUpdated.set(new Date());
    this.isLoading.set(false);
    this.isRefreshing.set(false);
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

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatLastUpdated(): string {
    const date = this.lastUpdated();
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
