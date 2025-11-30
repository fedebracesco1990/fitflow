import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState, LoadProfile } from '../../../../core/store';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-view-profile',
  standalone: true,
  imports: [
    RouterLink,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
})
export class ViewProfileComponent implements OnInit {
  private readonly store = inject(Store);

  readonly profile = this.store.selectSignal(UserState.profile);
  readonly isLoading = this.store.selectSignal(UserState.isLoading);

  ngOnInit(): void {
    if (!this.profile()) {
      this.store.dispatch(new LoadProfile());
    }
  }

  // Computed properties for template
  readonly profileName = computed(() => this.profile()?.name || '');

  readonly roleLabel = computed(() => {
    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      trainer: 'Entrenador',
      user: 'Usuario',
    };
    return roleLabels[this.profile()?.role || 'user'] || 'Usuario';
  });

  readonly roleBadgeVariant = computed(() => {
    const variants: Record<string, 'primary' | 'success' | 'warning'> = {
      admin: 'warning',
      trainer: 'success',
      user: 'primary',
    };
    return variants[this.profile()?.role || 'user'] || 'primary';
  });

  readonly formattedDate = computed(() => {
    const date = this.profile()?.createdAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}
