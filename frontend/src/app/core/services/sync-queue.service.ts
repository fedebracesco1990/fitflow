import { Injectable, inject, signal, computed } from '@angular/core';
import { OfflineDbService } from './offline-db.service';
import { SyncOperation, SyncOperationType, SyncStatus, MAX_RETRY_COUNT } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SyncQueueService {
  private readonly offlineDb = inject(OfflineDbService);

  private readonly _pendingCount = signal(0);
  private readonly _syncStatus = signal<SyncStatus>(SyncStatus.IDLE);
  private readonly _lastError = signal<string | null>(null);

  readonly pendingCount = this._pendingCount.asReadonly();
  readonly syncStatus = this._syncStatus.asReadonly();
  readonly lastError = this._lastError.asReadonly();

  readonly hasPendingOperations = computed(() => this._pendingCount() > 0);

  constructor() {
    this.refreshPendingCount();
  }

  async enqueue(
    type: SyncOperationType,
    endpoint: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    payload: unknown,
    tempId?: string
  ): Promise<string> {
    const operation: SyncOperation = {
      id: this.generateId(),
      type,
      endpoint,
      method,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      tempId,
    };

    await this.offlineDb.addToSyncQueue(operation);
    await this.refreshPendingCount();

    console.log('[SyncQueue] Enqueued operation:', type, endpoint);
    return operation.id;
  }

  async peek(): Promise<SyncOperation | undefined> {
    const queue = await this.offlineDb.getSyncQueue();
    return queue[0];
  }

  async dequeue(): Promise<SyncOperation | undefined> {
    const operation = await this.peek();
    if (operation) {
      await this.offlineDb.removeSyncOperation(operation.id);
      await this.refreshPendingCount();
    }
    return operation;
  }

  async markAsProcessing(id: string): Promise<void> {
    await this.offlineDb.updateSyncOperation(id, { status: 'processing' });
    this._syncStatus.set(SyncStatus.SYNCING);
  }

  async markAsCompleted(id: string, serverId?: string): Promise<void> {
    await this.offlineDb.updateSyncOperation(id, {
      status: 'completed',
      serverId,
    });
    await this.refreshPendingCount();

    const pending = this._pendingCount();
    if (pending === 0) {
      this._syncStatus.set(SyncStatus.SYNCED);
      setTimeout(() => {
        if (this._pendingCount() === 0) {
          this._syncStatus.set(SyncStatus.IDLE);
        }
      }, 3000);
    }
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    const queue = await this.offlineDb.getSyncQueue();
    const operation = queue.find((op) => op.id === id);

    if (operation && operation.retryCount < MAX_RETRY_COUNT) {
      await this.offlineDb.updateSyncOperation(id, {
        status: 'pending',
        retryCount: operation.retryCount + 1,
        error,
      });
    } else {
      await this.offlineDb.updateSyncOperation(id, {
        status: 'failed',
        error,
      });
      this._lastError.set(error);
      this._syncStatus.set(SyncStatus.ERROR);
    }

    await this.refreshPendingCount();
  }

  async getQueue(): Promise<SyncOperation[]> {
    return this.offlineDb.getSyncQueue();
  }

  async clear(): Promise<void> {
    await this.offlineDb.clearCompletedOperations();
    await this.refreshPendingCount();
  }

  async refreshPendingCount(): Promise<void> {
    const count = await this.offlineDb.getPendingCount();
    this._pendingCount.set(count);

    if (count > 0 && this._syncStatus() === SyncStatus.IDLE) {
      this._syncStatus.set(SyncStatus.PENDING);
    }
  }

  clearError(): void {
    this._lastError.set(null);
    if (this._syncStatus() === SyncStatus.ERROR) {
      this._syncStatus.set(this._pendingCount() > 0 ? SyncStatus.PENDING : SyncStatus.IDLE);
    }
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
