import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'fitflow_workout_timer';

interface TimerState {
  startTime: number | null;
  pausedAt: number | null;
  accumulatedTime: number;
  isRunning: boolean;
  workoutId: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutTimerService {
  private timerState = signal<TimerState>(this.loadState());
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentTime = signal<number>(Date.now());

  readonly isRunning = computed(() => this.timerState().isRunning);
  readonly workoutId = computed(() => this.timerState().workoutId);

  readonly elapsedSeconds = computed(() => {
    const state = this.timerState();
    if (!state.startTime) return 0;

    const now = state.isRunning ? this.currentTime() : (state.pausedAt || Date.now());
    const elapsed = now - state.startTime + state.accumulatedTime;
    return Math.floor(elapsed / 1000);
  });

  readonly formattedTime = computed(() => {
    const seconds = this.elapsedSeconds();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  constructor() {
    const state = this.timerState();
    if (state.isRunning) {
      this.startInterval();
    }
  }

  start(workoutId: string): void {
    const now = Date.now();
    this.timerState.set({
      startTime: now,
      pausedAt: null,
      accumulatedTime: 0,
      isRunning: true,
      workoutId,
    });
    this.saveState();
    this.startInterval();
  }

  resume(): void {
    const state = this.timerState();
    if (!state.startTime || state.isRunning) return;

    const pauseDuration = state.pausedAt ? Date.now() - state.pausedAt : 0;
    this.timerState.update((s) => ({
      ...s,
      startTime: (s.startTime || 0) + pauseDuration,
      pausedAt: null,
      isRunning: true,
    }));
    this.saveState();
    this.startInterval();
  }

  pause(): void {
    if (!this.timerState().isRunning) return;

    this.timerState.update((s) => ({
      ...s,
      pausedAt: Date.now(),
      isRunning: false,
    }));
    this.saveState();
    this.stopInterval();
  }

  stop(): number {
    const elapsed = this.elapsedSeconds();
    this.timerState.set({
      startTime: null,
      pausedAt: null,
      accumulatedTime: 0,
      isRunning: false,
      workoutId: null,
    });
    this.clearState();
    this.stopInterval();
    return elapsed;
  }

  reset(): void {
    this.stop();
  }

  private startInterval(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000);
  }

  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private loadState(): TimerState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as TimerState;
      }
    } catch {
      // Ignore parse errors
    }
    return {
      startTime: null,
      pausedAt: null,
      accumulatedTime: 0,
      isRunning: false,
      workoutId: null,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.timerState()));
    } catch {
      // Ignore storage errors
    }
  }

  private clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
