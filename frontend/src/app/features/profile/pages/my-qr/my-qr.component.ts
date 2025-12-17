import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services';
import {
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
  AlertComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-my-qr',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, LoadingSpinnerComponent, AlertComponent],
  templateUrl: './my-qr.component.html',
  styleUrl: './my-qr.component.scss',
})
export class MyQrComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly qrImageUrl = signal<string | null>(null);
  readonly isFullscreen = signal(false);

  ngOnInit(): void {
    this.loadQrCode();
  }

  ngOnDestroy(): void {
    const url = this.qrImageUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  loadQrCode(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getMyQr().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.qrImageUrl.set(url);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el código QR. Intenta nuevamente.');
        this.isLoading.set(false);
      },
    });
  }

  downloadQr(): void {
    const url = this.qrImageUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = 'mi-codigo-qr.png';
    link.click();
  }

  toggleFullscreen(): void {
    this.isFullscreen.update((value) => !value);
  }

  closeFullscreen(): void {
    this.isFullscreen.set(false);
  }
}
