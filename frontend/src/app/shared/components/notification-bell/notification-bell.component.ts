import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { NotificationsState } from '../../../core/store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-notification-bell',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      class="notification-bell"
      (click)="bellClick.emit()"
      [attr.aria-label]="
        'Notificaciones' + (unreadCount() > 0 ? ', ' + unreadCount() + ' sin leer' : '')
      "
    >
      <lucide-icon name="bell" [size]="20"></lucide-icon>
      @if (unreadCount() > 0) {
        <span class="badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
      }
    </button>
  `,
  styles: `
    .notification-bell {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-secondary, #64748b);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-hover, #f1f5f9);
        color: var(--text-primary, #1e293b);
      }
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      font-size: 11px;
      font-weight: 600;
      line-height: 18px;
      text-align: center;
      color: white;
      background: var(--color-error, #ef4444);
      border-radius: 9px;
    }
  `,
})
export class NotificationBellComponent {
  private readonly store = inject(Store);

  bellClick = output<void>();

  unreadCount = this.store.selectSignal(NotificationsState.unreadCount);
}
