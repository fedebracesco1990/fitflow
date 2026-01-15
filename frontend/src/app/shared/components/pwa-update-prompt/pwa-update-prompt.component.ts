import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-pwa-update-prompt',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isVisible()) {
      <div class="prompt-overlay" role="dialog" aria-modal="true">
        <div class="prompt-card">
          <div class="icon-wrapper">
            <lucide-icon name="refresh-cw" [size]="32"></lucide-icon>
          </div>
          <h3>Nueva versión disponible</h3>
          <p>Hay una actualización de FitFlow disponible con mejoras y correcciones.</p>
          <div class="actions">
            <button class="btn-secondary" (click)="onDismiss()">Más tarde</button>
            <button class="btn-primary" (click)="onUpdate()">
              <span>Actualizar ahora</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .prompt-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .prompt-card {
      width: 100%;
      max-width: 400px;
      margin: 16px;
      padding: 32px;
      background: white;
      border-radius: 16px;
      text-align: center;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      background: #ecfdf5;
      border-radius: 50%;
      color: #10b981;
    }

    h3 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    p {
      margin: 0 0 24px;
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-secondary,
    .btn-primary {
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    }

    .btn-primary {
      border: none;
      background: #10b981;
      color: white;

      &:hover {
        background: #059669;
      }
    }
  `,
})
export class PwaUpdatePromptComponent {
  isVisible = input<boolean>(false);

  updateNow = output<void>();
  dismissed = output<void>();

  onUpdate(): void {
    this.updateNow.emit();
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
