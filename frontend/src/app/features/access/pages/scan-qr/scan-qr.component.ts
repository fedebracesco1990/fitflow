import {
  Component,
  OnDestroy,
  signal,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { AccessService, ValidateQrResponse } from '../../services/access.service';
import {
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
  AlertComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-scan-qr',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, LoadingSpinnerComponent, AlertComponent],
  templateUrl: './scan-qr.component.html',
  styleUrl: './scan-qr.component.scss',
})
export class ScanQrComponent implements AfterViewInit, OnDestroy {
  @ViewChild('qrReader') qrReaderRef!: ElementRef<HTMLDivElement>;

  private readonly accessService = inject(AccessService);
  private html5QrCode: Html5Qrcode | null = null;

  readonly isScanning = signal(false);
  readonly isValidating = signal(false);
  readonly scanResult = signal<ValidateQrResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly cameraError = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.initScanner();
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  private async initScanner(): Promise<void> {
    try {
      this.html5QrCode = new Html5Qrcode('qr-reader');
      await this.startScanner();
    } catch {
      this.cameraError.set('No se pudo inicializar el escáner QR');
    }
  }

  async startScanner(): Promise<void> {
    if (!this.html5QrCode) return;

    this.scanResult.set(null);
    this.error.set(null);
    this.cameraError.set(null);

    try {
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => this.onScanSuccess(decodedText),
        () => {
          /* QR scan error callback - intentionally empty */
        }
      );
      this.isScanning.set(true);
    } catch {
      this.cameraError.set('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
  }

  async stopScanner(): Promise<void> {
    if (this.html5QrCode && this.isScanning()) {
      try {
        await this.html5QrCode.stop();
        this.isScanning.set(false);
      } catch {
        // Ignore errors when stopping
      }
    }
  }

  private async onScanSuccess(token: string): Promise<void> {
    await this.stopScanner();
    this.validateQr(token);
  }

  private validateQr(token: string): void {
    this.isValidating.set(true);
    this.error.set(null);

    this.accessService.validateQr(token).subscribe({
      next: (result) => {
        this.scanResult.set(result);
        this.isValidating.set(false);
      },
      error: () => {
        this.error.set('Error al validar el código QR. Intenta nuevamente.');
        this.isValidating.set(false);
      },
    });
  }

  scanAgain(): void {
    this.scanResult.set(null);
    this.error.set(null);
    this.startScanner();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
