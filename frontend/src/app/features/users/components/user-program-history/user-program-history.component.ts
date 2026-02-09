import { Component, input, signal, inject, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserProgramsService } from '../../../../core/services/user-programs.service';
import { UserProgram } from '../../../../core/models';
import { BadgeComponent, CardComponent, LoadingSpinnerComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-user-program-history',
  standalone: true,
  imports: [DatePipe, BadgeComponent, CardComponent, LoadingSpinnerComponent],
  templateUrl: './user-program-history.component.html',
  styleUrl: './user-program-history.component.scss',
})
export class UserProgramHistoryComponent implements OnInit {
  private readonly userProgramsService = inject(UserProgramsService);

  userId = input.required<string>();

  programs = signal<UserProgram[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  expandedProgramId = signal<string | null>(null);

  activeProgram = computed(() => this.programs().find((p) => p.isActive) ?? null);
  inactivePrograms = computed(() => this.programs().filter((p) => !p.isActive));

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userProgramsService.getUserProgramHistory(this.userId()).subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar historial de planes');
        this.loading.set(false);
      },
    });
  }

  toggleExpand(programId: string): void {
    this.expandedProgramId.update((current) => (current === programId ? null : programId));
  }

  isExpanded(programId: string): boolean {
    return this.expandedProgramId() === programId;
  }
}
