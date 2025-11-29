import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState, LoadProfile } from '../../../../core/store';

@Component({
  selector: 'fit-flow-view-profile',
  standalone: true,
  imports: [RouterLink],
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

  getInitials(): string {
    const name = this.profile()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleLabel(): string {
    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      trainer: 'Entrenador',
      user: 'Usuario',
    };
    return roleLabels[this.profile()?.role || 'user'] || 'Usuario';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
