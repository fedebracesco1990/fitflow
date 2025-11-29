import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, filter, take } from 'rxjs/operators';
import { AuthState } from '../store/auth/auth.state';
import { Role } from '../models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return store.select(AuthState.isInitialized).pipe(
    filter((isInitialized) => isInitialized),
    take(1),
    map(() => {
      const userRole = store.selectSnapshot(AuthState.userRole);

      if (!userRole || !allowedRoles.includes(userRole)) {
        router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
};
