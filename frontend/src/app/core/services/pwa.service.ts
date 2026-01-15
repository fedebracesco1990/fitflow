import { Injectable, inject, signal, computed, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const PWA_STORAGE_KEYS = {
  VISIT_COUNT: 'pwa_visit_count',
  INSTALL_DISMISSED: 'pwa_install_dismissed',
  INSTALL_DISMISSED_AT: 'pwa_install_dismissed_at',
} as const;

const MIN_VISITS_FOR_PROMPT = 2;
const DISMISS_COOLDOWN_DAYS = 7;

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private readonly _updateAvailable = signal(false);
  private readonly _canInstall = signal(false);
  private readonly _isInstalled = signal(false);

  readonly updateAvailable = this._updateAvailable.asReadonly();
  readonly canInstall = this._canInstall.asReadonly();
  readonly isInstalled = this._isInstalled.asReadonly();

  readonly shouldShowInstallPrompt = computed(() => {
    return (
      this._canInstall() &&
      !this._isInstalled() &&
      this.getVisitCount() >= MIN_VISITS_FOR_PROMPT &&
      !this.isInstallDismissedRecently()
    );
  });

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.incrementVisitCount();
    this.checkIfInstalled();
    this.setupInstallPromptListener();
    this.setupUpdateListener();
    this.setupPeriodicUpdateCheck();
  }

  private checkIfInstalled(): void {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    this._isInstalled.set(isStandalone);
  }

  private setupInstallPromptListener(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this._canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this._canInstall.set(false);
      this._isInstalled.set(true);
    });
  }

  private setupUpdateListener(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        this._updateAvailable.set(true);
      });
  }

  private setupPeriodicUpdateCheck(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable));
    const everyHour$ = interval(60 * 60 * 1000);
    const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHour$);

    everyHourOnceAppIsStable$.subscribe(async () => {
      try {
        await this.swUpdate.checkForUpdate();
      } catch (err) {
        console.error('[PWA] Failed to check for updates:', err);
      }
    });
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('[PWA] Failed to check for updates:', err);
      return false;
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
      this._updateAvailable.set(false);
      document.location.reload();
    } catch (err) {
      console.error('[PWA] Failed to apply update:', err);
    }
  }

  dismissUpdate(): void {
    this._updateAvailable.set(false);
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        this._canInstall.set(false);
        return true;
      }

      return false;
    } catch (err) {
      console.error('[PWA] Failed to prompt install:', err);
      return false;
    }
  }

  dismissInstallPrompt(): void {
    localStorage.setItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED, 'true');
    localStorage.setItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED_AT, Date.now().toString());
  }

  private getVisitCount(): number {
    const count = localStorage.getItem(PWA_STORAGE_KEYS.VISIT_COUNT);
    return count ? parseInt(count, 10) : 0;
  }

  private incrementVisitCount(): void {
    const currentCount = this.getVisitCount();
    localStorage.setItem(PWA_STORAGE_KEYS.VISIT_COUNT, (currentCount + 1).toString());
  }

  private isInstallDismissedRecently(): boolean {
    const dismissed = localStorage.getItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED);
    if (dismissed !== 'true') {
      return false;
    }

    const dismissedAt = localStorage.getItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED_AT);
    if (!dismissedAt) {
      return true;
    }

    const dismissedTimestamp = parseInt(dismissedAt, 10);
    const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const hasExpired = Date.now() - dismissedTimestamp > cooldownMs;

    if (hasExpired) {
      localStorage.removeItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED);
      localStorage.removeItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED_AT);
      return false;
    }

    return true;
  }
}
