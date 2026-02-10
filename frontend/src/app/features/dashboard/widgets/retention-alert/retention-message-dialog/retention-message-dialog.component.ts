import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../../shared';
import { ApiService } from '../../../../../core/services';

interface SendResult {
  success: boolean;
  sent: number;
}

@Component({
  selector: 'fit-flow-retention-message-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent],
  templateUrl: './retention-message-dialog.component.html',
  styleUrl: './retention-message-dialog.component.scss',
})
export class RetentionMessageDialogComponent {
  private readonly api = inject(ApiService);

  isOpen = input(false);
  userId = input.required<string>();
  userName = input.required<string>();

  closed = output<void>();
  sent = output<void>();

  title = signal('');
  body = signal('');
  sending = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  get canSend(): boolean {
    return this.title().trim() !== '' && this.body().trim() !== '' && !this.sending();
  }

  onClose(): void {
    this.resetForm();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onClose();
    }
  }

  async onSend(): Promise<void> {
    if (!this.canSend) return;

    this.sending.set(true);
    this.error.set(null);

    try {
      const result = await this.api
        .post<SendResult>('notifications/send', {
          userId: this.userId(),
          title: this.title(),
          body: this.body(),
        })
        .toPromise();

      if (result?.success) {
        this.success.set(true);
        setTimeout(() => {
          this.sent.emit();
          this.onClose();
        }, 1500);
      } else {
        this.error.set('No se pudo enviar la notificación');
      }
    } catch {
      this.error.set('Error al enviar la notificación');
    } finally {
      this.sending.set(false);
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.body.set('');
    this.error.set(null);
    this.success.set(false);
  }
}
