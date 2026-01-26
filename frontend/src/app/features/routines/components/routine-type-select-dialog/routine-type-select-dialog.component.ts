import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutineType } from '../../../../core/models';

@Component({
  selector: 'fit-flow-routine-type-select-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="dialog-backdrop" (click)="onBackdropClick($event)">
        <div class="dialog-container">
          <div class="dialog-header">
            <h2>Nueva Rutina</h2>
            <button class="close-btn" (click)="onCancel()">✕</button>
          </div>

          <div class="dialog-body">
            <p class="dialog-subtitle">¿Qué tipo de rutina deseas crear?</p>

            <div class="type-cards">
              <button class="type-card" (click)="selectType('daily')">
                <div class="card-icon">🏋️</div>
                <h3>Rutina Diaria</h3>
                <p>Una rutina simple con ejercicios para un día específico</p>
              </button>

              <button class="type-card" (click)="selectType('weekly')">
                <div class="card-icon">📅</div>
                <h3>Programa Semanal</h3>
                <p>Un programa completo con rutinas organizadas por día de la semana</p>
              </button>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-outline" (click)="onCancel()">Cancelar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-container {
        background: white;
        border-radius: 1rem;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #6b7280;
        cursor: pointer;
        padding: 0.25rem;

        &:hover {
          color: #1f2937;
        }
      }

      .dialog-body {
        padding: 1.5rem;
      }

      .dialog-subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 1.5rem;
      }

      .type-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .type-card {
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1.5rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .card-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }
      }

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .btn {
        padding: 0.625rem 1.25rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-outline {
        background: transparent;
        border: 1px solid #d1d5db;
        color: #374151;

        &:hover {
          border-color: #667eea;
          color: #667eea;
        }
      }

      @media (max-width: 480px) {
        .type-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RoutineTypeSelectDialogComponent {
  isOpen = input(false);

  typeSelected = output<RoutineType>();
  cancelled = output<void>();

  selectType(type: 'daily' | 'weekly'): void {
    this.typeSelected.emit(type === 'daily' ? RoutineType.DAILY : RoutineType.WEEKLY);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onCancel();
    }
  }
}
