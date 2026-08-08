import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RespiteService } from '../../core/services/respite.service';

@Component({
  selector: 'app-respite-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="journal-card bg-canvas p-6 sm:p-8 max-w-lg w-full relative my-8 shadow-xl">
        <button 
          (click)="close.emit()" 
          class="absolute top-4 right-4 text-ink/60 hover:text-ink tap-target p-2 rounded-lg"
          aria-label="Close form"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h2 class="text-2xl font-bold text-ink mb-1 font-serif-header">Request Care Coverage</h2>
        <p class="text-ink/80 text-sm mb-6">
          Post a time window when you need a family member to step in and cover care duties.
        </p>

        @if (errorMessage()) {
          <div class="p-3 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-4 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="save()" class="space-y-4">
          <div>
            <label for="requested_by" class="block text-sm font-semibold text-ink mb-1">Your Name (Family Member) *</label>
            <input 
              id="requested_by"
              type="text" 
              [(ngModel)]="form.requested_by" 
              name="requested_by"
              placeholder="e.g. Fatima"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="date" class="block text-sm font-semibold text-ink mb-1">Date *</label>
              <input 
                id="date"
                type="date" 
                [(ngModel)]="form.date" 
                name="date"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>

            <div>
              <label for="time_range" class="block text-sm font-semibold text-ink mb-1">Time Window *</label>
              <input 
                id="time_range"
                type="text" 
                [(ngModel)]="form.time_range" 
                name="time_range"
                placeholder="e.g. Tue 2:00 PM – 6:00 PM"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label for="note" class="block text-sm font-semibold text-ink mb-1">Coverage Note (Optional)</label>
            <textarea 
              id="note"
              [(ngModel)]="form.note" 
              name="note"
              rows="3"
              placeholder="e.g. Doctor appointment / errand run. Vitals check needed at 4 PM."
              class="w-full px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            ></textarea>
          </div>

          <div class="pt-3 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              [disabled]="isSaving()"
              class="flex-1 tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ isSaving() ? 'Posting...' : 'Post Request' }}
            </button>
            
            <button 
              type="button" 
              (click)="close.emit()"
              class="tap-target px-5 py-3 border border-ink/20 text-ink rounded-xl font-medium hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RespiteFormComponent {
  private respiteService = inject(RespiteService);

  @Output() close = new EventEmitter<void>();

  form = {
    requested_by: '',
    date: new Date().toISOString().split('T')[0],
    time_range: '',
    note: ''
  };

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  async save() {
    if (!this.form.requested_by || !this.form.date || !this.form.time_range) {
      this.errorMessage.set('Please fill in your name, date, and time window.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const res = await this.respiteService.addRequest(this.form);

    this.isSaving.set(false);
    if (res.error) {
      this.errorMessage.set(res.error.message || 'Unable to post request.');
    } else {
      this.close.emit();
    }
  }
}
