import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MemberAnalysis } from '../../models';
import { BadgeComponent } from '../../../../shared';
import {
  MembershipStatusBadgePipe,
  MembershipStatusLabelPipe,
} from '../../pipes/membership-status-badge.pipe';

@Component({
  selector: 'fit-flow-member-analysis-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    MembershipStatusBadgePipe,
    MembershipStatusLabelPipe,
  ],
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

  readonly paginatedMembers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allMembers().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.allMembers().length / this.pageSize);
  });

  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPrevPage = computed(() => this.currentPage() > 1);

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
