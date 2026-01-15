import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { LucideAngularModule } from 'lucide-angular';
import { PersonalRecordsState, LoadPersonalRecords } from '../../../../core/store';
import { PrCardComponent } from '../../components/pr-card/pr-card.component';
import { PrBadgeComponent } from '../../components/pr-badge/pr-badge.component';
import { CardComponent, LoadingSpinnerComponent, EmptyStateComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-my-records',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    PrCardComponent,
    PrBadgeComponent,
    CardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="records-page">
      <div class="page-header">
        <a routerLink="/profile" class="back-link">
          <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          Volver al perfil
        </a>
        <h1>Mis Récords Personales</h1>
      </div>

      @if (isLoading()) {
        <div class="loading-container">
          <fit-flow-loading-spinner size="lg" />
        </div>
      } @else {
        <section class="badges-section">
          <h2>Insignias</h2>
          <div class="badges-grid">
            @for (badge of badges(); track badge.level) {
              <fit-flow-pr-badge [badge]="badge" />
            }
          </div>
        </section>

        <section class="stats-section">
          <fit-flow-card padding="md">
            <div class="stats-row">
              <div class="stat">
                <span class="stat-value">{{ totalCount() }}</span>
                <span class="stat-label">PRs Totales</span>
              </div>
              @if (highestBadge()) {
                <div class="stat">
                  <lucide-icon
                    [name]="highestBadge()!.icon"
                    [size]="24"
                    class="badge-icon"
                  ></lucide-icon>
                  <span class="stat-label">{{ highestBadge()!.label }}</span>
                </div>
              }
            </div>
          </fit-flow-card>
        </section>

        <section class="records-section">
          <h2>Todos los Récords</h2>
          @if (records().length === 0) {
            <fit-flow-empty-state
              icon="trophy"
              title="Sin récords aún"
              description="Completa ejercicios en tus rutinas para registrar tus récords personales"
            />
          } @else {
            <div class="records-grid">
              @for (record of records(); track record.id) {
                <fit-flow-pr-card [record]="record" />
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: `
    .records-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 12px;
      transition: color 0.2s;

      &:hover {
        color: #1e293b;
      }
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    h2 {
      margin: 0 0 16px;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .badges-section {
      margin-bottom: 32px;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .stats-section {
      margin-bottom: 32px;
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #6366f1;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
    }

    .badge-icon {
      color: #f59e0b;
    }

    .records-section {
      margin-bottom: 32px;
    }

    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
  `,
})
export class MyRecordsComponent implements OnInit {
  private readonly store = inject(Store);

  readonly records = this.store.selectSignal(PersonalRecordsState.records);
  readonly isLoading = this.store.selectSignal(PersonalRecordsState.isLoading);
  readonly totalCount = this.store.selectSignal(PersonalRecordsState.totalCount);
  readonly badges = this.store.selectSignal(PersonalRecordsState.currentBadges);
  readonly highestBadge = this.store.selectSignal(PersonalRecordsState.highestBadge);

  ngOnInit(): void {
    this.store.dispatch(new LoadPersonalRecords());
  }
}
