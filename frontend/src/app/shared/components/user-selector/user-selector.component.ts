import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsersService } from '../../../core/services/users.service';
import { User, Role } from '../../../core/models';

export interface SelectableUser extends User {
  selected: boolean;
}

@Component({
  selector: 'fit-flow-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-selector.component.html',
  styleUrl: './user-selector.component.scss',
})
export class UserSelectorComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  disabled = input(false);
  membershipStatus = input<string>('active');

  selectionChange = output<User[]>();

  users = signal<SelectableUser[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  });

  selectedUsers = computed(() => this.users().filter((u) => u.selected));
  selectedCount = computed(() => this.selectedUsers().length);

  allFilteredSelected = computed(() => {
    const filtered = this.filteredUsers();
    return filtered.length > 0 && filtered.every((u) => u.selected);
  });

  someFilteredSelected = computed(() => {
    const filtered = this.filteredUsers();
    return filtered.some((u) => u.selected) && !filtered.every((u) => u.selected);
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService
      .getAll({ role: Role.USER, membershipStatus: this.membershipStatus(), limit: 100 })
      .subscribe({
        next: (response) => {
          this.users.set(response.data.map((u) => ({ ...u, selected: false })));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al cargar usuarios');
          this.loading.set(false);
        },
      });
  }

  toggleUser(user: SelectableUser): void {
    if (this.disabled()) return;
    this.users.update((list) =>
      list.map((u) => (u.id === user.id ? { ...u, selected: !u.selected } : u))
    );
    this.emitSelection();
  }

  selectAll(): void {
    if (this.disabled()) return;
    const filtered = this.filteredUsers();
    const allSelected = filtered.every((u) => u.selected);
    this.users.update((list) =>
      list.map((u) => {
        const isInFiltered = filtered.some((f) => f.id === u.id);
        return isInFiltered ? { ...u, selected: !allSelected } : u;
      })
    );
    this.emitSelection();
  }

  clearSelection(): void {
    this.users.update((list) => list.map((u) => ({ ...u, selected: false })));
    this.emitSelection();
  }

  private emitSelection(): void {
    this.selectionChange.emit(this.selectedUsers());
  }
}
