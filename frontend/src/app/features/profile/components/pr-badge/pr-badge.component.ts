import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PrBadge } from '../../../../core/models';

@Component({
  selector: 'fit-flow-pr-badge',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="badge-item" [class.achieved]="badge().achieved" [class.locked]="!badge().achieved">
      <div class="badge-icon">
        <lucide-icon [name]="badge().icon" [size]="24"></lucide-icon>
      </div>
      <div class="badge-info">
        <span class="badge-label">{{ badge().label }}</span>
        <span class="badge-level">{{ badge().level }} PRs</span>
      </div>
      @if (!badge().achieved) {
        <lucide-icon name="lock" [size]="16" class="lock-icon"></lucide-icon>
      }
    </div>
  `,
  styles: `
    .badge-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      background: white;
      border: 2px solid #e2e8f0;
      transition: all 0.2s;

      &.achieved {
        border-color: #fbbf24;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);

        .badge-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .badge-label {
          color: #92400e;
        }

        .badge-level {
          color: #b45309;
        }
      }

      &.locked {
        opacity: 0.6;

        .badge-icon {
          background: #f1f5f9;
          color: #94a3b8;
        }
      }
    }

    .badge-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
    }

    .badge-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .badge-label {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .badge-level {
      font-size: 12px;
      color: #64748b;
    }

    .lock-icon {
      color: #94a3b8;
    }
  `,
})
export class PrBadgeComponent {
  badge = input.required<PrBadge>();
}
