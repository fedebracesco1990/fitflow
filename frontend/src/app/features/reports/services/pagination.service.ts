import { Injectable, signal, computed, Signal } from '@angular/core';

export interface PaginationConfig<T> {
  items: T[];
  pageSize: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class PaginationService<T> {
  private readonly allItems = signal<T[]>([]);
  private readonly currentPage = signal(1);
  private pageSize = 10;

  readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allItems().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.allItems().length / this.pageSize);
  });

  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPrevPage = computed(() => this.currentPage() > 1);

  readonly state = computed<PaginationState>(() => ({
    currentPage: this.currentPage(),
    totalPages: this.totalPages(),
    hasNextPage: this.hasNextPage(),
    hasPrevPage: this.hasPrevPage(),
  }));

  setItems(items: T[], pageSize: number = 10): void {
    this.allItems.set(items);
    this.pageSize = pageSize;
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.currentPage.update((p) => p - 1);
    }
  }

  reset(): void {
    this.currentPage.set(1);
  }
}
