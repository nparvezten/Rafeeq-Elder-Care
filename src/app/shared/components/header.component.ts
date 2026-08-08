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
    <header class="bg-canvas border-b border-ink/10 sticky top-0 z-40 backdrop-blur-md bg-canvas/95">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        <!-- App Brand Header -->
        <a routerLink="/" (click)="closeMobileMenu()" class="flex items-center gap-2.5 group tap-target py-1">
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

        <!-- Right Side: Auth status & Mobile Toggle -->
        <div class="flex items-center gap-2">
          @if (currentUser()) {
            <span class="hidden md:inline text-xs bg-hearth/20 border border-hearth/40 text-ink px-3 py-1.5 rounded-full font-medium">
              {{ currentUser()?.email }}
            </span>
            <button 
              (click)="signOut()"
              class="tap-target px-3 py-1.5 text-xs font-semibold border border-ink/20 text-ink rounded-xl hover:bg-ink/5 transition-colors"
            >
              Sign Out
            </button>
          } @else {
            <button 
              (click)="showAuthModal.set(true)"
              class="tap-target px-3.5 py-2 text-xs sm:text-sm font-semibold bg-companion text-canvas rounded-xl hover:bg-companion/90 transition-colors shadow-sm"
            >
              Sign In
            </button>
          }

          <!-- Mobile Hamburger Toggle Button -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden tap-target p-2 text-ink/80 hover:text-ink border border-ink/15 rounded-xl bg-canvas/60 ml-1"
            aria-label="Toggle Navigation Menu"
          >
            @if (isMobileMenuOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Desktop Navigation Tabs -->
      <nav class="hidden md:flex max-w-6xl mx-auto px-4 border-t border-ink/5 overflow-x-auto no-scrollbar">
        <a 
          routerLink="/wisdom" 
          routerLinkActive="border-companion text-companion font-bold"
          [routerLinkActiveOptions]="{ exact: true }"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Wisdom
        </a>

        <a 
          routerLink="/attendants" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Attendants
        </a>

        <a 
          routerLink="/expenses" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Expenses
        </a>

        <a 
          routerLink="/respite" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Respite Board
        </a>

        <a 
          routerLink="/diagnostics" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Diagnostics
        </a>

        <a 
          routerLink="/helplines" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Helplines
        </a>

        <a 
          routerLink="/gratitude" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Gratitude
        </a>

        <a 
          routerLink="/settings" 
          routerLinkActive="border-companion text-companion font-bold"
          class="tap-target px-3.5 py-3 border-b-2 border-transparent text-ink/70 hover:text-ink text-sm font-semibold transition-all whitespace-nowrap"
        >
          Settings
        </a>
      </nav>

      <!-- Mobile Dropdown Navigation Menu -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden border-t border-ink/10 bg-canvas/95 px-4 py-3 space-y-1 shadow-lg">
          <a 
            routerLink="/wisdom" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            [routerLinkActiveOptions]="{ exact: true }"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            📖 Shared Wisdom
          </a>

          <a 
            routerLink="/attendants" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            👥 Attendant Directory
          </a>

          <a 
            routerLink="/expenses" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            💰 Shared Expenses
          </a>

          <a 
            routerLink="/respite" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            🤝 Respite Board
          </a>

          <a 
            routerLink="/diagnostics" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            🏥 Diagnostic Directory
          </a>

          <a 
            routerLink="/helplines" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            📞 Helplines
          </a>

          <a 
            routerLink="/gratitude" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            ✍️ Private Gratitude
          </a>

          <a 
            routerLink="/settings" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-companion/10 text-companion font-bold border-companion/30"
            class="block tap-target px-4 py-3 rounded-xl border border-transparent text-ink/80 hover:text-ink text-base font-semibold transition-all"
          >
            🔔 Reminders & Settings
          </a>
        </div>
      }
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
  readonly isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  async signOut() {
    this.closeMobileMenu();
    await this.supabaseService.signOut();
  }
}
