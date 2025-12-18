import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NetworkService } from '../../core/services';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

export interface SidebarUser {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'fit-flow-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() menuItems: MenuItem[] = [];
  @Input() user: SidebarUser | null = null;
  @Input() mobileOpen = false;

  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  readonly network = inject(NetworkService);

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  onCloseMobile(): void {
    this.closeMobile.emit();
  }

  onLogout(): void {
    this.logoutClick.emit();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      trainer: 'Entrenador',
      user: 'Socio',
    };
    return labels[role.toLowerCase()] || role;
  }
}
