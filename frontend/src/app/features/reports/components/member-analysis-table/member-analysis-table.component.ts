import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberAnalysis } from '../../models';
import { BadgeComponent } from '../../../../shared';
import {
  MembershipStatusBadgePipe,
  MembershipStatusLabelPipe,
} from '../../pipes/membership-status-badge.pipe';

@Component({
  selector: 'fit-flow-member-analysis-table',
  standalone: true,
  imports: [CommonModule, BadgeComponent, MembershipStatusBadgePipe, MembershipStatusLabelPipe],
  templateUrl: './member-analysis-table.component.html',
  styleUrl: './member-analysis-table.component.scss',
})
export class MemberAnalysisTableComponent {
  @Input() set members(value: MemberAnalysis[]) {
    this.allMembers.set(value);
  }

  readonly allMembers = signal<MemberAnalysis[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = 15;
  readonly filterStatus = signal<'ALL' | 'ACTIVE' | 'OVERDUE' | 'INACTIVE'>('ALL');
  readonly sortBy = signal<'estado' | 'visitas' | 'miembro'>('estado');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly filteredAndSortedMembers = computed(() => {
    let members = [...this.allMembers()];

    // Filtrar por estado
    if (this.filterStatus() !== 'ALL') {
      members = members.filter((m) => m.estado === this.filterStatus());
    }

    // Ordenar
    members.sort((a, b) => {
      const sortBy = this.sortBy();
      const order = this.sortOrder() === 'asc' ? 1 : -1;

      if (sortBy === 'estado') {
        const statusOrder = { ACTIVE: 1, OVERDUE: 2, INACTIVE: 3 };
        return (statusOrder[a.estado] - statusOrder[b.estado]) * order;
      } else if (sortBy === 'visitas') {
        return (a.visitasTotales - b.visitasTotales) * order;
      } else {
        return a.miembro.localeCompare(b.miembro) * order;
      }
    });

    return members;
  });

  readonly paginatedMembers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAndSortedMembers().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredAndSortedMembers().length / this.pageSize);
  });

  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPrevPage = computed(() => this.currentPage() > 1);

  setFilter(status: 'ALL' | 'ACTIVE' | 'OVERDUE' | 'INACTIVE'): void {
    this.filterStatus.set(status);
    this.currentPage.set(1);
  }

  setSortBy(field: 'estado' | 'visitas' | 'miembro'): void {
    if (this.sortBy() === field) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
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
}
