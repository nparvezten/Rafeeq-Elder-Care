import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogomarkComponent } from './logomark.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LogomarkComponent],
  template: `
    <div class="journal-card p-8 text-center my-6 max-w-lg mx-auto flex flex-col items-center">
      <div class="mb-4">
        <app-logomark [size]="48"></app-logomark>
      </div>
      <h3 class="text-xl font-semibold text-ink mb-2 font-serif-header">{{ title }}</h3>
      <p class="text-ink/80 text-base mb-6 leading-relaxed max-w-sm">{{ message }}</p>
      
      @if (actionLabel) {
        <button 
          (click)="action.emit()"
          class="tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium shadow-sm hover:bg-companion/95 transition-colors focus:ring-2 focus:ring-companion/40 outline-none"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
