import { signal } from '@angular/core';

/**
 * Small history list persisted in localStorage, newest first and capped at `maxItems`.
 * Subclasses build their own items and call `push()`.
 */
export abstract class LocalHistoryStore<T> {
  private readonly _history = signal<T[]>([]);
  readonly history = this._history.asReadonly();

  protected constructor(
    private readonly storageKey: string,
    private readonly maxItems = 10
  ) {
    this.loadFromStorage();
  }

  clearHistory(): void {
    this._history.set([]);
    localStorage.removeItem(this.storageKey);
  }

  protected push(item: T): void {
    const updated = [item, ...this._history()].slice(0, this.maxItems);
    this._history.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this._history.set(JSON.parse(stored) as T[]);
      }
    } catch {
      this._history.set([]);
    }
  }

  private saveToStorage(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  }
}
