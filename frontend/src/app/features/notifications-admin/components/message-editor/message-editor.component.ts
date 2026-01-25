import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

export interface MessageContent {
  title: string;
  body: string;
}

@Component({
  selector: 'fit-flow-message-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss',
})
export class MessageEditorComponent {
  disabled = input(false);
  showPreview = input(true);

  contentChange = output<MessageContent>();

  title = signal('');
  body = signal('');

  hasContent = computed(() => this.title().trim() !== '' && this.body().trim() !== '');

  onTitleChange(value: string): void {
    this.title.set(value);
    this.emitContent();
  }

  onBodyChange(value: string): void {
    this.body.set(value);
    this.emitContent();
  }

  clear(): void {
    this.title.set('');
    this.body.set('');
    this.emitContent();
  }

  private emitContent(): void {
    this.contentChange.emit({
      title: this.title(),
      body: this.body(),
    });
  }
}
