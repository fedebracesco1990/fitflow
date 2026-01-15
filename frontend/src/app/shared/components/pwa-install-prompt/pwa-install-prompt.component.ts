import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isVisible()) {
      <div class="prompt-overlay" role="dialog" aria-modal="true">
        <div class="prompt-card">
          <div class="icon-wrapper">
            <lucide-icon name="download" [size]="32"></lucide-icon>
          </div>
          <h3>Instalar FitFlow</h3>
          <p>Instala la app en tu dispositivo para acceso rápido y funcionalidad offline.</p>
          <ul class="benefits">
            <li>
              <lucide-icon name="wifi-off" [size]="16"></lucide-icon>
              <span>Funciona sin conexión</span>
            </li>
            <li>
              <lucide-icon name="clock" [size]="16"></lucide-icon>
              <span>Acceso más rápido</span>
            </li>
            <li>
              <lucide-icon name="bell" [size]="16"></lucide-icon>
              <span>Notificaciones push</span>
            </li>
          </ul>
          <div class="actions">
            <button class="btn-secondary" (click)="onDismiss()">Ahora no</button>
            <button class="btn-primary" (click)="onInstall()" [disabled]="isInstalling()">
              @if (isInstalling()) {
                <span>Instalando...</span>
              } @else {
                <span>Instalar</span>
              }
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
      background: #eff6ff;
      border-radius: 50%;
      color: #3b82f6;
    }

    h3 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    p {
      margin: 0 0 16px;
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .benefits {
      list-style: none;
      padding: 0;
      margin: 0 0 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      li {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 13px;
        color: #475569;

        lucide-icon {
          color: #3b82f6;
        }
      }
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
      background: #3b82f6;
      color: white;

      &:hover:not(:disabled) {
        background: #2563eb;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  `,
})
export class PwaInstallPromptComponent {
  isVisible = input<boolean>(false);

  install = output<void>();
  dismissed = output<void>();

  isInstalling = signal(false);

  async onInstall(): Promise<void> {
    this.isInstalling.set(true);
    this.install.emit();
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
