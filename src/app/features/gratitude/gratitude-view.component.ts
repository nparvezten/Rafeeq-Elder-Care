import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GratitudeService } from '../../core/services/gratitude.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthModalComponent } from '../auth/auth-modal.component';

@Component({
  selector: 'app-gratitude-view',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModalComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-6">
      
      <!-- Section Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Private Family Reflection</h1>
        <p class="text-ink/80 text-base mt-1">
          A quiet space to log daily reflections and moments of gratitude. Private to your family.
        </p>
      </div>

      <!-- Today's Prompt Card Form -->
      <div class="journal-card p-6 sm:p-8 mb-8 bg-canvas/90 border-warmth/30">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warmth mb-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          Today's Reflection Prompt
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-ink font-serif-header mb-4">
          "{{ todayPrompt() }}"
        </h2>

        @if (errorMessage()) {
          <div class="p-3 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-4 text-sm">
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="p-3 bg-hearth/20 border border-hearth/40 text-ink rounded-xl mb-4 text-sm">
            {{ successMessage() }}
          </div>
        }

        <form (ngSubmit)="saveReflection()" class="space-y-4">
          <div>
            <textarea 
              [(ngModel)]="responseText" 
              name="responseText"
              rows="4"
              placeholder="Write a few quiet lines here..."
              class="w-full p-4 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none text-base"
            ></textarea>
          </div>

          <div class="flex items-center justify-between gap-4 pt-1">
            <span class="text-xs text-ink/60">Saved privately to family reflections</span>

            @if (currentUser()) {
              <button 
                type="submit" 
                [disabled]="isSaving() || !responseText.trim()"
                class="tap-target px-6 py-2.5 bg-companion text-canvas rounded-xl font-bold hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
              >
                {{ isSaving() ? 'Saving...' : 'Save Reflection' }}
              </button>
            } @else {
              <button 
                type="button"
                (click)="showAuthModal.set(true)"
                class="tap-target px-5 py-2 border border-companion text-companion rounded-xl font-semibold hover:bg-companion/10 text-sm"
              >
                Sign in to Save
              </button>
            }
          </div>
        </form>
      </div>

      <!-- Reflection History View -->
      <h2 class="text-xl font-bold text-ink font-serif-header mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-companion" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Past Reflections History
      </h2>

      @if (entries().length > 0) {
        <div class="space-y-4">
          @for (entry of entries(); track entry.id) {
            <div class="journal-card p-6 hover:border-ink/20 transition-all">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-ink/60">
                  {{ entry.entry_date }}
                </span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-hearth/20 text-ink font-medium">
                  Family Private
                </span>
              </div>

              <p class="text-sm font-semibold text-companion font-serif-header mb-2">
                Q: {{ entry.prompt_text }}
              </p>

              <p class="text-base text-ink/90 leading-relaxed font-sans italic bg-canvas/60 p-4 rounded-xl border border-ink/10">
                "{{ entry.response }}"
              </p>
            </div>
          }
        </div>
      } @else {
        <div class="journal-card p-6 text-center text-ink/70 text-sm italic">
          No reflections logged yet. Write today's reflection above to start your family's quiet journal.
        </div>
      }
    </div>

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class GratitudeViewComponent {
  private gratitudeService = inject(GratitudeService);
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly todayPrompt = this.gratitudeService.todayPrompt;
  readonly entries = this.gratitudeService.entries;

  responseText: string = '';
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  readonly showAuthModal = signal<boolean>(false);

  async saveReflection() {
    if (!this.responseText.trim()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const res = await this.gratitudeService.addEntry(this.responseText);

    this.isSaving.set(false);
    if (res.error) {
      this.errorMessage.set(res.error.message || 'Unable to save reflection.');
    } else {
      this.successMessage.set('Reflection saved to private family journal.');
      this.responseText = '';
    }
  }
}
