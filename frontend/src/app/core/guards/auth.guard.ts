import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { map, filter, take } from 'rxjs/operators';
import { AuthState } from '../store/auth/auth.state';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isInitialized).pipe(
    filter((isInitialized) => isInitialized),
    take(1),
    map(() => {
      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }

      const mustChangePassword = store.selectSnapshot(AuthState.mustChangePassword);
      if (mustChangePassword && state.url !== '/change-password') {
        router.navigate(['/change-password']);
        return false;
      }

      return true;
    })
  );
};
