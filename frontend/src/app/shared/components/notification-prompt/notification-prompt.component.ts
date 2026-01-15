import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { PushNotificationsService } from '../../../core/services';
import { SetPermissionStatus, SetFcmToken } from '../../../core/store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-notification-prompt',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isVisible()) {
      <div class="prompt-overlay" role="dialog" aria-modal="true">
        <div class="prompt-card">
          <div class="icon-wrapper" [class.warning]="requiresPWA()">
            <lucide-icon [name]="requiresPWA() ? 'smartphone' : 'bell'" [size]="32"></lucide-icon>
          </div>
          @if (requiresPWA()) {
            <h3>Instala la app primero</h3>
            <p>{{ supportMessage() }}</p>
            <div class="actions">
              <button class="btn-primary" (click)="onDismiss()">Entendido</button>
            </div>
          } @else {
            <h3>Activa las notificaciones</h3>
            <p>
              Recibe alertas sobre vencimientos de membresía, recordatorios de entrenamiento y más.
            </p>
            <div class="actions">
              <button class="btn-secondary" (click)="onDismiss()">Ahora no</button>
              <button class="btn-primary" (click)="onEnable()" [disabled]="isLoading()">
                @if (isLoading()) {
                  <span>Activando...</span>
                } @else {
                  <span>Activar</span>
                }
              </button>
            </div>
          }
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

      &.warning {
        background: #fef3c7;
        color: #d97706;
      }
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
export class NotificationPromptComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly pushService = inject(PushNotificationsService);

  isVisible = input<boolean>(false);
  dismissed = output<void>();

  isLoading = signal(false);
  requiresPWA = signal(false);
  supportMessage = signal('');

  ngOnInit(): void {
    const support = this.pushService.checkSupport();
    this.requiresPWA.set(support.requiresPWA);
    this.supportMessage.set(support.message || '');
  }

  async onEnable(): Promise<void> {
    this.isLoading.set(true);

    try {
      const permission = await this.pushService.requestPermission();
      this.store.dispatch(new SetPermissionStatus(permission));

      if (permission === 'granted') {
        try {
          const token = await this.pushService.getAndRegisterToken();
          if (token) {
            this.store.dispatch(new SetFcmToken(token));
          }
        } catch (error) {
          console.error(
            '[NotificationPrompt] Failed to register token, will retry on next login:',
            error
          );
        }
      }
    } finally {
      this.isLoading.set(false);
      this.dismissed.emit();
    }
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
