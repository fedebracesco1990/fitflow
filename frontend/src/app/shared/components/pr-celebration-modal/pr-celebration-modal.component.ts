import { Component, inject, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { LucideAngularModule } from 'lucide-angular';
import { PersonalRecordsState, DismissCelebration } from '../../../core/store';
import confetti from 'canvas-confetti';

@Component({
  selector: 'fit-flow-pr-celebration-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (celebrationData()) {
      <div
        class="modal-backdrop"
        (click)="dismiss()"
        (keydown.escape)="dismiss()"
        tabindex="0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pr-celebration-title"
      >
        <div class="modal-content" role="document">
          <canvas #confettiCanvas class="confetti-canvas"></canvas>

          <div class="celebration-icon">
            <lucide-icon name="party-popper" [size]="64"></lucide-icon>
          </div>

          <h2 id="pr-celebration-title" class="title">Nuevo Récord Personal</h2>

          <div class="pr-details">
            <p class="exercise-name">{{ celebrationData()?.exerciseName }}</p>
            <div class="stats">
              <span class="weight">{{ celebrationData()?.weight }} kg</span>
              <span class="separator">×</span>
              <span class="reps">{{ celebrationData()?.reps }} reps</span>
            </div>
            <span class="pr-type">{{ getPrTypeLabel() }}</span>
          </div>

          <button class="dismiss-btn" (click)="dismiss()">Continuar</button>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      position: relative;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .confetti-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .celebration-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border-radius: 50%;
      margin-bottom: 24px;
      color: white;
      animation: bounce 0.6s ease infinite alternate;
    }

    @keyframes bounce {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(-8px);
      }
    }

    .title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 24px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .pr-details {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .exercise-name {
      color: #c7d2fe;
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 16px;
    }

    .stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .weight {
      font-size: 36px;
      font-weight: 700;
      color: #fbbf24;
    }

    .separator {
      font-size: 24px;
      color: #818cf8;
    }

    .reps {
      font-size: 36px;
      font-weight: 700;
      color: #34d399;
    }

    .pr-type {
      display: inline-block;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: #1e1b4b;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 6px 16px;
      border-radius: 20px;
    }

    .dismiss-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
      color: white;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  `,
})
export class PrCelebrationModalComponent {
  private readonly store = inject(Store);
  private readonly confettiCanvas = viewChild<ElementRef<HTMLCanvasElement>>('confettiCanvas');

  celebrationData = this.store.selectSignal(PersonalRecordsState.celebrationData);

  constructor() {
    effect(() => {
      const data = this.celebrationData();
      if (data) {
        setTimeout(() => this.fireConfetti(), 100);
        setTimeout(() => this.dismiss(), 5000);
      }
    });
  }

  getPrTypeLabel(): string {
    const type = this.celebrationData()?.type;
    switch (type) {
      case 'weight':
        return 'PR de Peso';
      case 'volume':
        return 'PR de Volumen';
      case 'both':
        return 'PR de Peso y Volumen';
      default:
        return 'Nuevo PR';
    }
  }

  dismiss(): void {
    this.store.dispatch(new DismissCelebration());
  }

  private fireConfetti(): void {
    const canvas = this.confettiCanvas()?.nativeElement;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    myConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#818cf8', '#6366f1', '#34d399'],
    });

    setTimeout(() => {
      myConfetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#818cf8'],
      });
    }, 250);

    setTimeout(() => {
      myConfetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#34d399', '#fbbf24'],
      });
    }, 400);
  }
}
