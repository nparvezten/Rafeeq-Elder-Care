import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="journal-card bg-canvas p-6 sm:p-8 max-w-md w-full relative shadow-xl">
        <button 
          (click)="close.emit()" 
          class="absolute top-4 right-4 text-ink/60 hover:text-ink tap-target p-2 rounded-lg"
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h2 class="text-2xl font-bold text-ink mb-2 font-serif-header">Sign In / Access</h2>
        <p class="text-ink/80 text-base mb-6">
          Enter your family email address to receive a secure sign-in magic link or access directory updates.
        </p>

        @if (sentMessage()) {
          <div class="p-4 bg-hearth/20 border border-hearth/40 text-ink rounded-xl mb-6 text-sm">
            {{ sentMessage() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="p-4 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-6 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="handleSignIn()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-semibold text-ink mb-1">Email Address</label>
            <input 
              id="email"
              type="email" 
              [(ngModel)]="email" 
              name="email"
              placeholder="family@example.com"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink placeholder:text-ink/40 focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="pt-2 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              [disabled]="isSubmitting()"
              class="flex-1 tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ isSubmitting() ? 'Sending link...' : 'Send Magic Link' }}
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
export class AuthModalComponent {
  private supabaseService = inject(SupabaseService);

  @Output() close = new EventEmitter<void>();

  email: string = '';
  isSubmitting = signal<boolean>(false);
  sentMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  async handleSignIn() {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.sentMessage.set(null);

    const { error } = await this.supabaseService.signInWithMagicLink(this.email);

    this.isSubmitting.set(false);
    if (error) {
      this.errorMessage.set(error.message || 'Unable to send sign-in link. Please check configuration.');
    } else {
      this.sentMessage.set('Magic link sent to your email. Click the link in your inbox to sign in.');
    }
  }
}
