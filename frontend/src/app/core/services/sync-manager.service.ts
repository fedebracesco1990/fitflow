import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { filter, firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';
import { SyncQueueService } from './sync-queue.service';
import { OfflineDbService } from './offline-db.service';
import { SyncOperation, RETRY_DELAY_MS } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SyncManagerService {
  private readonly http = inject(HttpClient);
  private readonly networkService = inject(NetworkService);
  private readonly syncQueueService = inject(SyncQueueService);
  private readonly offlineDb = inject(OfflineDbService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _isSyncing = signal(false);
  private readonly _lastSyncAt = signal<number | null>(null);

  readonly isSyncing = this._isSyncing.asReadonly();
  readonly lastSyncAt = this._lastSyncAt.asReadonly();
  readonly syncStatus = this.syncQueueService.syncStatus;
  readonly pendingCount = this.syncQueueService.pendingCount;

  readonly syncSummary = computed(() => ({
    status: this.syncStatus(),
    pending: this.pendingCount(),
    lastSync: this._lastSyncAt(),
    isSyncing: this._isSyncing(),
  }));

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener(): void {
    this.networkService.isOnline$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((isOnline) => isOnline)
      )
      .subscribe(() => {
        console.log('[SyncManager] Network restored, starting sync...');
        this.processQueue();
      });
  }

  async processQueue(): Promise<void> {
    if (this._isSyncing() || !this.networkService.isOnline()) {
      return;
    }

    const pending = await this.syncQueueService.getQueue();
    if (pending.length === 0) {
      return;
    }

    this._isSyncing.set(true);
    console.log(`[SyncManager] Processing ${pending.length} pending operations`);

    for (const operation of pending) {
      if (!this.networkService.isOnline()) {
        console.log('[SyncManager] Lost connection, stopping sync');
        break;
      }

      await this.processOperation(operation);
    }

    this._isSyncing.set(false);
    this._lastSyncAt.set(Date.now());
    await this.syncQueueService.clear();
    console.log('[SyncManager] Queue processing complete');
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    await this.syncQueueService.markAsProcessing(operation.id);

    try {
      const url = `${environment.apiUrl}/${operation.endpoint}`;
      let response: unknown;

      switch (operation.method) {
        case 'POST':
          response = await firstValueFrom(this.http.post(url, operation.payload));
          break;
        case 'PATCH':
          response = await firstValueFrom(this.http.patch(url, operation.payload));
          break;
        case 'DELETE':
          response = await firstValueFrom(this.http.delete(url));
          break;
      }

      const serverId = this.extractServerId(response);

      if (operation.tempId && serverId) {
        await this.offlineDb.addIdMapping({
          tempId: operation.tempId,
          serverId,
          type: this.getIdMappingType(operation.type),
          createdAt: Date.now(),
        });
      }

      await this.syncQueueService.markAsCompleted(operation.id, serverId);
      console.log(`[SyncManager] Operation ${operation.type} completed`);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error(`[SyncManager] Operation ${operation.type} failed:`, errorMessage);
      await this.syncQueueService.markAsFailed(operation.id, errorMessage);

      await this.delay(RETRY_DELAY_MS * (operation.retryCount + 1));
    }
  }

  private extractServerId(response: unknown): string | undefined {
    if (response && typeof response === 'object' && 'id' in response) {
      return (response as { id: string }).id;
    }
    return undefined;
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      if ('error' in error && typeof (error as { error: unknown }).error === 'object') {
        const errorObj = (error as { error: { message?: string } }).error;
        if (errorObj?.message) {
          return errorObj.message;
        }
      }
      if ('message' in error) {
        return (error as { message: string }).message;
      }
    }
    return 'Unknown error';
  }

  private getIdMappingType(operationType: string): 'workout' | 'exercise_log' {
    if (operationType.includes('workout')) {
      return 'workout';
    }
    return 'exercise_log';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async forcSync(): Promise<void> {
    if (!this.networkService.isOnline()) {
      console.log('[SyncManager] Cannot force sync while offline');
      return;
    }
    await this.processQueue();
  }

  async resolveId(tempId: string): Promise<string> {
    const serverId = await this.offlineDb.getServerIdByTempId(tempId);
    return serverId || tempId;
  }
}
