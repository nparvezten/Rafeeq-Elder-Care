import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogomarkComponent } from './logomark.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthModalComponent } from '../../features/auth/auth-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogomarkComponent, AuthModalComponent],
  template: `
    <header class="bg-canvas border-b border-ink/10 sticky top-0 z-40 backdrop-blur-md bg-canvas/90">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        <!-- App Brand Header -->
        <a routerLink="/" class="flex items-center gap-2.5 group tap-target py-1">
          <app-logomark [size]="32"></app-logomark>
          <div class="flex flex-col">
            <span class="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-companion transition-colors">
              Rafeeq Care
            </span>
            <span class="text-[11px] uppercase tracking-wider text-ink/60 font-semibold -mt-1">
              Family Coordination
            </span>
          </div>
        </a>

        <!-- Right Side: Auth status & sign in -->
        <div class="flex items-center gap-2">
          @if (currentUser()) {
            <span class="hidden sm:inline text-xs bg-hearth/20 border border-hearth/40 text-ink px-3 py-1.5 rounded-full font-medium">
              {{ currentUser()?.email }}
            </span>
            <button 
              (click)="signOut()"
              class="tap-target px-3.5 py-2 text-xs font-semibold border border-ink/20 text-ink rounded-xl hover:bg-ink/5 transition-colors"
            >
              Sign Out
            </button>
          } @else {
            <button 
              (click)="showAuthModal.set(true)"
              class="tap-target px-4 py-2 text-sm font-semibold bg-companion text-canvas rounded-xl hover:bg-companion/90 transition-colors shadow-sm"
            >
              Sign In
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="max-w-4xl mx-auto px-4 flex border-t border-ink/5 overflow-x-auto">
        <a 
          routerLink="/attendants" 
          routerLinkActive="border-companion text-companion font-bold"
          [routerLinkActiveOptions]="{ exact: false }"
          class="tap-target px-5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-base font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          Attendant Directory
        </a>

        <a 
          routerLink="/expenses" 
          routerLinkActive="border-companion text-companion font-bold"
          [routerLinkActiveOptions]="{ exact: false }"
          class="tap-target px-5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-base font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"/>
          </svg>
          Shared Expense Tracker
        </a>
      </nav>
    </header>

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class HeaderComponent {
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly showAuthModal = signal<boolean>(false);

  async signOut() {
    await this.supabaseService.signOut();
  }
}
