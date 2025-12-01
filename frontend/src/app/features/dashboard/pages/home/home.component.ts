import { Component, inject, OnInit, computed } from '@angular/core';
import { Store } from '@ngxs/store';
import { RouterLink } from '@angular/router';
import { AuthState, UserState, LoadProfile } from '../../../../core/store';
import { NetworkService } from '../../../../core/services';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';
import { Role } from '../../../../core/models';

@Component({
  selector: 'fit-flow-home',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, CardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly store = inject(Store);
  readonly network = inject(NetworkService);

  readonly user = this.store.selectSignal(AuthState.user);
  readonly profile = this.store.selectSignal(UserState.profile);
  readonly userRole = this.store.selectSignal(AuthState.userRole);

  // Role checks
  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  readonly isTrainer = this.store.selectSignal(AuthState.isTrainer);
  readonly isUser = computed(() => this.userRole() === Role.USER);

  // Computed properties for template
  readonly welcomeName = computed(() => this.profile()?.name || this.user()?.email || 'Usuario');

  readonly roleLabel = computed(() => {
    switch (this.userRole()) {
      case Role.ADMIN:
        return 'Administrador';
      case Role.TRAINER:
        return 'Entrenador';
      default:
        return 'Usuario';
    }
  });

  ngOnInit(): void {
    if (!this.profile()) {
      this.store.dispatch(new LoadProfile());
    }
  }
}
