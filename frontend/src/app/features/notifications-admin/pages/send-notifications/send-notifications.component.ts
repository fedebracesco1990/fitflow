import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../../core/services';
import { User } from '../../../../core/models';
import { UserSelectorComponent } from '../../../../shared';
import { MessageEditorComponent, MessageContent } from '../../components/message-editor/message-editor.component';
import { NotificationHistoryComponent } from '../../components/notification-history/notification-history.component';
import { NotificationHistoryService } from '../../services';
import { NotificationTargetType } from '../../models';

type SendMode = 'broadcast' | 'selected';

interface NotificationResult {
  success: boolean;
  sent: number;
}

@Component({
  selector: 'fit-flow-send-notifications',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UserSelectorComponent,
    MessageEditorComponent,
    NotificationHistoryComponent,
  ],
  templateUrl: './send-notifications.component.html',
  styleUrl: './send-notifications.component.scss',
})
export class SendNotificationsComponent {
  private readonly api = inject(ApiService);
  private readonly historyService = inject(NotificationHistoryService);

  sendMode = signal<SendMode>('broadcast');
  selectedUsers = signal<User[]>([]);
  messageContent = signal<MessageContent>({ title: '', body: '' });
  isSending = signal(false);
  result = signal<NotificationResult | null>(null);

  canSend = computed(() => {
    const content = this.messageContent();
    const hasContent = content.title.trim() !== '' && content.body.trim() !== '';
    if (this.sendMode() === 'broadcast') {
      return hasContent;
    }
    return hasContent && this.selectedUsers().length > 0;
  });

  setSendMode(mode: SendMode): void {
    this.sendMode.set(mode);
    this.result.set(null);
  }

  onUsersSelected(users: User[]): void {
    this.selectedUsers.set(users);
  }

  onContentChange(content: MessageContent): void {
    this.messageContent.set(content);
  }

  getSendButtonText(): string {
    if (this.sendMode() === 'broadcast') {
      return 'Enviar a Todos';
    }
    const count = this.selectedUsers().length;
    return `Enviar a ${count} usuario(s)`;
  }

  async send(): Promise<void> {
    if (!this.canSend()) return;

    this.isSending.set(true);
    this.result.set(null);

    const content = this.messageContent();
    const isBroadcast = this.sendMode() === 'broadcast';

    try {
      let totalSent = 0;
      let success = true;

      if (isBroadcast) {
        const res = await this.sendBroadcast(content.title, content.body);
        totalSent = res.sent;
        success = res.success;
      } else {
        const res = await this.sendToMultipleUsers(content.title, content.body);
        totalSent = res.sent;
        success = res.success;
      }

      this.result.set({ success, sent: totalSent });

      const targetType = isBroadcast ? NotificationTargetType.BROADCAST : NotificationTargetType.SELECTED;
      const recipientCount = isBroadcast ? 0 : this.selectedUsers().length;
      const recipientNames = isBroadcast ? undefined : this.selectedUsers().map((u) => u.name);

      this.historyService.addToHistory(
        content.title,
        content.body,
        targetType,
        recipientCount,
        success,
        totalSent,
        recipientNames
      );
    } catch {
      this.result.set({ success: false, sent: 0 });
    } finally {
      this.isSending.set(false);
    }
  }

  private async sendBroadcast(title: string, body: string): Promise<NotificationResult> {
    const result = await this.api
      .post<NotificationResult>('notifications/send', { broadcast: true, title, body })
      .toPromise();
    return result || { success: false, sent: 0 };
  }

  private async sendToMultipleUsers(title: string, body: string): Promise<NotificationResult> {
    const users = this.selectedUsers();
    let totalSent = 0;
    let allSuccess = true;

    for (const user of users) {
      try {
        const result = await this.api
          .post<NotificationResult>('notifications/send', { userId: user.id, title, body })
          .toPromise();
        if (result?.success) {
          totalSent += result.sent;
        } else {
          allSuccess = false;
        }
      } catch {
        allSuccess = false;
      }
    }

    return { success: allSuccess, sent: totalSent };
  }
}
