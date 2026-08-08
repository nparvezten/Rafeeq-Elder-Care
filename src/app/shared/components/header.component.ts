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
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        <!-- App Brand Header -->
        <a routerLink="/" class="flex items-center gap-2.5 group tap-target py-1">
          <app-logomark [size]="32"></app-logomark>
          <div class="flex flex-col">
            <span class="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-companion transition-colors">
              Rafeeq Care
            </span>
            <span class="text-[11px] uppercase tracking-wider text-ink/60 font-semibold -mt-1">
              Family Eldercare Companion
            </span>
          </div>
        </a>

        <!-- Right Side: Auth status & sign in -->
        <div class="flex items-center gap-2">
          @if (currentUser()) {
            <span class="hidden md:inline text-xs bg-hearth/20 border border-hearth/40 text-ink px-3 py-1.5 rounded-full font-medium">
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
      <nav class="max-w-6xl mx-auto px-4 flex border-t border-ink/5 overflow-x-auto no-scrollbar">
        <a 
          routerLink="/wisdom" 
          routerLinkActive="border-companion text-companion font-bold"
          [routerLinkActiveOptions]="{ exact: true }"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Wisdom
        </a>

        <a 
          routerLink="/attendants" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Attendants
        </a>

        <a 
          routerLink="/expenses" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Expenses
        </a>

        <a 
          routerLink="/respite" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Respite Board
        </a>

        <a 
          routerLink="/diagnostics" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Diagnostics
        </a>

        <a 
          routerLink="/helplines" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Helplines
        </a>

        <a 
          routerLink="/gratitude" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Gratitude
        </a>

        <a 
          routerLink="/settings" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          Settings
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
