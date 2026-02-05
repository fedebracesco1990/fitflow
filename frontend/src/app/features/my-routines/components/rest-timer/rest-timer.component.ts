import { Component, input, output, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fit-flow-rest-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rest-timer.component.html',
  styleUrl: './rest-timer.component.scss',
})
export class RestTimerComponent implements OnInit, OnDestroy {
  isActive = input(false);
  duration = input(90);

  completed = output<void>();
  skipped = output<void>();

  remainingSeconds = signal(90);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      if (this.isActive()) {
        this.remainingSeconds.set(this.duration());
        this.startCountdown();
      } else {
        this.stopCountdown();
      }
    });
  }

  ngOnInit(): void {
    if (this.isActive()) {
      this.remainingSeconds.set(this.duration());
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  get formattedTime(): string {
    const seconds = this.remainingSeconds();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onSkip(): void {
    this.stopCountdown();
    this.skipped.emit();
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.intervalId = setInterval(() => {
      this.remainingSeconds.update((v) => {
        if (v <= 1) {
          this.stopCountdown();
          this.completed.emit();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
