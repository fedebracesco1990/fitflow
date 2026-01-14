import { Component, inject, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Store } from '@ngxs/store';
import {
  NotificationsState,
  MarkAsRead,
  MarkAllAsRead,
  RemoveNotification,
  ClearAllNotifications,
} from '../../../core/store';
import { PushNotification } from '../../../core/services';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-notification-center',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe],
  template: `
    @if (isOpen()) {
      <div
        class="backdrop"
        (click)="closePanel.emit()"
        (keydown.escape)="closePanel.emit()"
        role="button"
        tabindex="-1"
        aria-label="Cerrar notificaciones"
      ></div>
    }
    <div class="notification-center" [class.open]="isOpen()">
      <div class="header">
        <h3>Notificaciones</h3>
        <div class="actions">
          @if (notifications().length > 0) {
            <button class="action-btn" (click)="onMarkAllRead()" title="Marcar todas como leídas">
              <lucide-icon name="check" [size]="16"></lucide-icon>
            </button>
            <button class="action-btn" (click)="onClearAll()" title="Limpiar todas">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
          }
          <button class="close-btn" (click)="closePanel.emit()">
            <lucide-icon name="x" [size]="18"></lucide-icon>
          </button>
        </div>
      </div>

      <div class="content">
        @if (notifications().length === 0) {
          <div class="empty-state">
            <lucide-icon name="bell-off" [size]="48"></lucide-icon>
            <p>No tienes notificaciones</p>
          </div>
        } @else {
          <ul class="notification-list">
            @for (notification of notifications(); track notification.id) {
              <li
                class="notification-item"
                [class.unread]="!notification.read"
                (click)="onNotificationClick(notification)"
                (keydown.enter)="onNotificationClick(notification)"
                tabindex="0"
                role="button"
              >
                <div class="notification-content">
                  <strong class="title">{{ notification.title }}</strong>
                  <p class="body">{{ notification.body }}</p>
                  <span class="time">{{ notification.timestamp | date: 'dd/MM HH:mm' }}</span>
                </div>
                <button
                  class="remove-btn"
                  (click)="onRemove($event, notification.id)"
                  title="Eliminar"
                >
                  <lucide-icon name="x" [size]="14"></lucide-icon>
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
    }

    .notification-center {
      position: absolute;
      top: 100%;
      right: 0;
      width: 360px;
      max-height: 480px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1000;

      &.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(8px);
      }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }

      .actions {
        display: flex;
        gap: 4px;
      }

      .action-btn,
      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: #64748b;

        &:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
      }
    }

    .content {
      max-height: 400px;
      overflow-y: auto;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: #94a3b8;

      p {
        margin: 16px 0 0;
        font-size: 14px;
      }
    }

    .notification-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover {
        background: #f8fafc;
      }

      &.unread {
        background: #eff6ff;

        &:hover {
          background: #dbeafe;
        }

        .title {
          color: #1d4ed8;
        }
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .title {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .body {
      margin: 0 0 6px;
      font-size: 13px;
      color: #64748b;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .time {
      font-size: 11px;
      color: #94a3b8;
    }

    .remove-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      color: #94a3b8;
      opacity: 0;
      transition: all 0.15s ease;

      .notification-item:hover & {
        opacity: 1;
      }

      &:hover {
        background: #fee2e2;
        color: #ef4444;
      }
    }
  `,
})
export class NotificationCenterComponent {
  private readonly store = inject(Store);

  isOpen = input<boolean>(false);
  closePanel = output<void>();

  notifications = this.store.selectSignal(NotificationsState.notifications);

  onNotificationClick(notification: PushNotification): void {
    if (!notification.read) {
      this.store.dispatch(new MarkAsRead(notification.id));
    }
  }

  onMarkAllRead(): void {
    this.store.dispatch(new MarkAllAsRead());
  }

  onClearAll(): void {
    this.store.dispatch(new ClearAllNotifications());
  }

  onRemove(event: Event, id: string): void {
    event.stopPropagation();
    this.store.dispatch(new RemoveNotification(id));
  }
}
