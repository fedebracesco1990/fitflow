import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { AuthState, Logout, LogoutSuccess } from '../../core/store';
import { NetworkService } from '../../core/services';

@Component({
  selector: 'fit-flow-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  readonly network = inject(NetworkService);

  readonly user = this.store.selectSignal(AuthState.user);

  logout(): void {
    this.actions$.pipe(ofActionSuccessful(LogoutSuccess), take(1)).subscribe(() => {
      this.router.navigate(['/login']);
    });
    this.store.dispatch(new Logout());
  }
}
