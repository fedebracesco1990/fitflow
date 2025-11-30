import { Component, inject, OnInit, computed } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState, UserState, LoadProfile } from '../../../../core/store';
import { NetworkService } from '../../../../core/services';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-home',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly store = inject(Store);
  readonly network = inject(NetworkService);

  readonly user = this.store.selectSignal(AuthState.user);
  readonly profile = this.store.selectSignal(UserState.profile);

  // Computed properties for template
  readonly welcomeName = computed(() => this.profile()?.name || this.user()?.email || 'Usuario');

  ngOnInit(): void {
    if (!this.profile()) {
      this.store.dispatch(new LoadProfile());
    }
  }
}
