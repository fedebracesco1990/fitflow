import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
  APP_INITIALIZER,
  inject,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import {
  LucideAngularModule,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  IdCard,
  Tags,
  CreditCard,
  Dumbbell,
  ClipboardList,
  QrCode,
  CalendarCheck,
  ListChecks,
  User,
  Users,
  LogOut,
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  ClipboardCheck,
  RefreshCw,
  Download,
  UserPlus,
  Scan,
  Bell,
  BellOff,
  Check,
  Trash2,
} from 'lucide-angular';

import { routes } from './app.routes';
import { AuthState, UserState, NotificationsState, CheckSession } from './core/store';
import { authInterceptor, errorInterceptor } from './core/interceptors';
import { PageTitleStrategy } from './core/services';
import { environment } from '../environments/environment';

function initializeAuth(): () => Promise<void> {
  const store = inject(Store);

  return async () => {
    store.dispatch(new CheckSession());
    await firstValueFrom(
      store.select(AuthState.isInitialized).pipe(
        filter((isInitialized) => isInitialized),
        take(1)
      )
    );
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideStore(
      [AuthState, UserState, NotificationsState],
      withNgxsStoragePlugin({
        keys: ['auth.user', 'auth.isAuthenticated', 'user.profile', 'notifications.notifications'],
      }),
      withNgxsReduxDevtoolsPlugin({ disabled: environment.production })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
    },
    {
      provide: TitleStrategy,
      useClass: PageTitleStrategy,
    },
    importProvidersFrom(
      LucideAngularModule.pick({
        Menu,
        X,
        ChevronLeft,
        ChevronRight,
        LayoutDashboard,
        BarChart3,
        IdCard,
        Tags,
        CreditCard,
        Dumbbell,
        ClipboardList,
        QrCode,
        CalendarCheck,
        ListChecks,
        User,
        Users,
        LogOut,
        Wifi,
        WifiOff,
        Clock,
        AlertTriangle,
        DollarSign,
        Calendar,
        ClipboardCheck,
        RefreshCw,
        Download,
        UserPlus,
        Scan,
        Bell,
        BellOff,
        Check,
        Trash2,
      })
    ),
  ],
};
