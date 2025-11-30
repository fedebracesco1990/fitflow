import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-avatar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  name = input<string>('');
  imageUrl = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  protected get avatarClass(): Record<string, boolean> {
    return { [`avatar--${this.size()}`]: true };
  }

  protected get avatarImageUrl(): string {
    return this.imageUrl();
  }

  protected get avatarName(): string {
    return this.name();
  }

  protected get hasImage(): boolean {
    return !!this.imageUrl();
  }

  protected get initials(): string {
    const name = this.name();
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
