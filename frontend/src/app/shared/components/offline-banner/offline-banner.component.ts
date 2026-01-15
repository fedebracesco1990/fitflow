import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../../core/services';

@Component({
  selector: 'fit-flow-offline-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (networkService.isOffline()) {
      <div class="offline-banner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="2" x2="22" y1="2" y2="22" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
          <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
          <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
          <path d="M5 13a10 10 0 0 1 5.24-2.76" />
          <line x1="12" x2="12.01" y1="20" y2="20" />
        </svg>
        <span>Sin conexión - Los cambios se guardarán localmente</span>
      </div>
    }
  `,
  styles: [
    `
      .offline-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #fef3c7;
        color: #92400e;
        font-size: 0.875rem;
        font-weight: 500;
        border-bottom: 1px solid #fcd34d;
      }

      svg {
        flex-shrink: 0;
      }
    `,
  ],
})
export class OfflineBannerComponent {
  readonly networkService = inject(NetworkService);
}
