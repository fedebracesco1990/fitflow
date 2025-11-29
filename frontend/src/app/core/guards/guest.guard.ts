import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, filter, take } from 'rxjs/operators';
import { AuthState } from '../store/auth/auth.state';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isInitialized).pipe(
    filter((isInitialized) => isInitialized),
    take(1),
    map(() => {
      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

      if (isAuthenticated) {
        router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
};
