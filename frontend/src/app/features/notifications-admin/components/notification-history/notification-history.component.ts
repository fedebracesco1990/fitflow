import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationHistoryService } from '../../services';
import { TARGET_TYPE_LABELS, NotificationTargetType } from '../../models';

@Component({
  selector: 'fit-flow-notification-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './notification-history.component.html',
  styleUrl: './notification-history.component.scss',
})
export class NotificationHistoryComponent {
  private readonly historyService = inject(NotificationHistoryService);

  readonly history = this.historyService.history;
  readonly targetLabels = TARGET_TYPE_LABELS;

  getTargetLabel(type: NotificationTargetType): string {
    return this.targetLabels[type];
  }

  clearHistory(): void {
    this.historyService.clearHistory();
  }
}
