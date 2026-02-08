import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncQueueService, SyncManagerService } from '../../../core/services';
import { SyncStatus } from '../../../core/models';

@Component({
  selector: 'fit-flow-sync-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="sync-button"
      [class.syncing]="isSyncing()"
      [class.pending]="isPending()"
      [class.error]="isError()"
      [title]="statusLabel()"
      (click)="onSyncClick()"
    >
      @switch (status()) {
        @case ('syncing') {
          <svg
            class="sync-icon spinning"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        }
        @case ('pending') {
          <div class="pending-indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2v4" />
              <path d="m16.2 7.8 2.9-2.9" />
              <path d="M18 12h4" />
              <path d="m16.2 16.2 2.9 2.9" />
              <path d="M12 18v4" />
              <path d="m4.9 19.1 2.9-2.9" />
              <path d="M2 12h4" />
              <path d="m4.9 4.9 2.9 2.9" />
            </svg>
            @if (pendingCount() > 0) {
              <span class="badge">{{ pendingCount() }}</span>
            }
          </div>
        }
        @case ('error') {
          <svg
            class="error-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        }
        @case ('synced') {
          <svg
            class="synced-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        }
        @default {
          <svg
            class="cloud-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        }
      }
    </button>
  `,
  styles: [
    `
      .sync-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        background: transparent;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary, #64748b);
        transition: all 0.2s;
      }

      .sync-button:hover {
        background-color: var(--bg-hover, #f1f5f9);
      }

      .sync-button.syncing {
        color: var(--primary, #3b82f6);
      }

      .sync-button.pending {
        color: var(--warning, #f59e0b);
      }

      .sync-button.error {
        color: var(--error, #ef4444);
      }

      .pending-indicator {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        background-color: var(--warning, #f59e0b);
        color: white;
        font-size: 10px;
        font-weight: 600;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .synced-icon {
        color: var(--success, #22c55e);
      }

      .error-icon {
        color: var(--error, #ef4444);
      }
    `,
  ],
})
export class SyncStatusComponent {
  private readonly syncQueue = inject(SyncQueueService);
  private readonly syncManager = inject(SyncManagerService);

  readonly status = this.syncQueue.syncStatus;
  readonly pendingCount = this.syncQueue.pendingCount;

  readonly isSyncing = computed(() => this.status() === SyncStatus.SYNCING);
  readonly isPending = computed(() => this.status() === SyncStatus.PENDING);
  readonly isError = computed(() => this.status() === SyncStatus.ERROR);

  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case SyncStatus.SYNCING:
        return 'Sincronizando...';
      case SyncStatus.PENDING:
        return `${this.pendingCount()} cambios pendientes`;
      case SyncStatus.ERROR:
        return 'Error de sincronización';
      case SyncStatus.SYNCED:
        return 'Sincronizado';
      default:
        return 'Conectado';
    }
  });

  onSyncClick(): void {
    if (this.isPending() || this.isError()) {
      this.syncManager.forceSync();
    }
  }
}
