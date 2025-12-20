import { Pipe, PipeTransform } from '@angular/core';

type BadgeVariant = 'success' | 'error' | 'warning';

@Pipe({
  name: 'membershipStatusBadge',
  standalone: true,
})
export class MembershipStatusBadgePipe implements PipeTransform {
  transform(status: string): BadgeVariant {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'OVERDUE':
        return 'error';
      default:
        return 'warning';
    }
  }
}

@Pipe({
  name: 'membershipStatusLabel',
  standalone: true,
})
export class MembershipStatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      OVERDUE: 'Moroso',
      INACTIVE: 'Inactivo',
    };
    return labels[status] || status;
  }
}
