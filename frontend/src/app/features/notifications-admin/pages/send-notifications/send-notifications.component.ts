import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../../core/services';

interface NotificationResult {
  success: boolean;
  sent: number;
}

@Component({
  selector: 'fit-flow-send-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Enviar Notificaciones</h1>
        <p>Envía notificaciones push a los usuarios del gimnasio</p>
      </header>

      <div class="cards-grid">
        <!-- Broadcast Card -->
        <div class="card">
          <div class="card-header">
            <lucide-icon name="users" [size]="24"></lucide-icon>
            <h2>Notificación Masiva</h2>
          </div>
          <p class="card-description">Envía una notificación a todos los usuarios registrados</p>

          <form (ngSubmit)="sendBroadcast()" class="form">
            <div class="form-group">
              <label for="broadcast-title">Título</label>
              <input
                id="broadcast-title"
                type="text"
                [(ngModel)]="broadcastTitle"
                name="broadcastTitle"
                placeholder="Ej: 🎉 Promoción especial"
                required
              />
            </div>

            <div class="form-group">
              <label for="broadcast-body">Mensaje</label>
              <textarea
                id="broadcast-body"
                [(ngModel)]="broadcastBody"
                name="broadcastBody"
                placeholder="Escribe el mensaje de la notificación..."
                rows="3"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn-primary" [disabled]="isSendingBroadcast()">
              @if (isSendingBroadcast()) {
                <span>Enviando...</span>
              } @else {
                <lucide-icon name="bell" [size]="18"></lucide-icon>
                <span>Enviar a Todos</span>
              }
            </button>
          </form>

          @if (broadcastResult()) {
            <div class="result" [class.success]="broadcastResult()!.success">
              @if (broadcastResult()!.success) {
                <lucide-icon name="check" [size]="18"></lucide-icon>
                <span>Notificación enviada a {{ broadcastResult()!.sent }} dispositivos</span>
              } @else {
                <lucide-icon name="alert-triangle" [size]="18"></lucide-icon>
                <span>Error al enviar la notificación</span>
              }
            </div>
          }
        </div>

        <!-- Individual User Card -->
        <div class="card">
          <div class="card-header">
            <lucide-icon name="user" [size]="24"></lucide-icon>
            <h2>Notificación Individual</h2>
          </div>
          <p class="card-description">Envía una notificación a un usuario específico</p>

          <form (ngSubmit)="sendToUser()" class="form">
            <div class="form-group">
              <label for="user-id">ID de Usuario (UUID)</label>
              <input
                id="user-id"
                type="text"
                [(ngModel)]="userId"
                name="userId"
                placeholder="Ej: 550e8400-e29b-41d4-a716-446655440000"
                required
              />
            </div>

            <div class="form-group">
              <label for="user-title">Título</label>
              <input
                id="user-title"
                type="text"
                [(ngModel)]="userTitle"
                name="userTitle"
                placeholder="Ej: Recordatorio personal"
                required
              />
            </div>

            <div class="form-group">
              <label for="user-body">Mensaje</label>
              <textarea
                id="user-body"
                [(ngModel)]="userBody"
                name="userBody"
                placeholder="Escribe el mensaje personalizado..."
                rows="3"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn-secondary" [disabled]="isSendingUser()">
              @if (isSendingUser()) {
                <span>Enviando...</span>
              } @else {
                <lucide-icon name="bell" [size]="18"></lucide-icon>
                <span>Enviar a Usuario</span>
              }
            </button>
          </form>

          @if (userResult()) {
            <div class="result" [class.success]="userResult()!.success">
              @if (userResult()!.success) {
                <lucide-icon name="check" [size]="18"></lucide-icon>
                <span>Notificación enviada a {{ userResult()!.sent }} dispositivos</span>
              } @else {
                <lucide-icon name="alert-triangle" [size]="18"></lucide-icon>
                <span>Error al enviar la notificación</span>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;

      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }

      p {
        margin: 0;
        color: #64748b;
        font-size: 14px;
      }
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      color: #3b82f6;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .card-description {
      margin: 0 0 20px;
      color: #64748b;
      font-size: 14px;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      input,
      textarea {
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #3b82f6;
        }

        &::placeholder {
          color: #94a3b8;
        }
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }
    }

    .btn-primary,
    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: #3b82f6;
      color: white;

      &:hover:not(:disabled) {
        background: #2563eb;
      }
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;

      &:hover:not(:disabled) {
        background: #e2e8f0;
      }
    }

    .result {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      background: #fef2f2;
      color: #dc2626;

      &.success {
        background: #f0fdf4;
        color: #16a34a;
      }
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }

      .page-container {
        padding: 16px;
      }
    }
  `,
})
export class SendNotificationsComponent {
  private readonly api = inject(ApiService);

  broadcastTitle = '';
  broadcastBody = '';
  userId = '';
  userTitle = '';
  userBody = '';

  isSendingBroadcast = signal(false);
  isSendingUser = signal(false);
  broadcastResult = signal<NotificationResult | null>(null);
  userResult = signal<NotificationResult | null>(null);

  async sendBroadcast(): Promise<void> {
    if (!this.broadcastTitle || !this.broadcastBody) return;

    this.isSendingBroadcast.set(true);
    this.broadcastResult.set(null);

    try {
      const result = await this.api
        .post<NotificationResult>('notifications/send', {
          broadcast: true,
          title: this.broadcastTitle,
          body: this.broadcastBody,
        })
        .toPromise();

      this.broadcastResult.set(result || { success: false, sent: 0 });

      if (result?.success) {
        this.broadcastTitle = '';
        this.broadcastBody = '';
      }
    } catch {
      this.broadcastResult.set({ success: false, sent: 0 });
    } finally {
      this.isSendingBroadcast.set(false);
    }
  }

  async sendToUser(): Promise<void> {
    if (!this.userId || !this.userTitle || !this.userBody) return;

    this.isSendingUser.set(true);
    this.userResult.set(null);

    try {
      const result = await this.api
        .post<NotificationResult>('notifications/send', {
          userId: this.userId,
          title: this.userTitle,
          body: this.userBody,
        })
        .toPromise();

      this.userResult.set(result || { success: false, sent: 0 });

      if (result?.success) {
        this.userId = '';
        this.userTitle = '';
        this.userBody = '';
      }
    } catch {
      this.userResult.set({ success: false, sent: 0 });
    } finally {
      this.isSendingUser.set(false);
    }
  }
}
