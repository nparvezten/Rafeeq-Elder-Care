import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelplineService } from '../../core/services/helpline.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Helpline, HelplineScope } from '../../core/models/helpline.model';
import { HelplineFormComponent } from './helpline-form.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AuthModalComponent } from '../auth/auth-modal.component';

@Component({
  selector: 'app-helpline-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HelplineFormComponent, EmptyStateComponent, AuthModalComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Section Header & Add Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Helpline Directory</h1>
          <p class="text-ink/80 text-base mt-0.5">
            Verified emergency numbers, eldercare hotlines, and international crisis support lines.
          </p>
        </div>

        <div>
          @if (currentUser()) {
            <button 
              (click)="openAddModal()"
              class="tap-target px-5 py-3 bg-companion text-canvas rounded-xl font-semibold hover:bg-companion/95 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Helpline
            </button>
          } @else {
            <button 
              (click)="showAuthModal.set(true)"
              class="tap-target px-5 py-3 border border-companion text-companion rounded-xl font-semibold hover:bg-companion/10 transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Sign in to Add / Edit
            </button>
          }
        </div>
      </div>

      <!-- Filter Bar (Reusing directory pattern) -->
      <div class="journal-card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <!-- Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search helplines by name, phone, or area..."
            class="w-full tap-target pl-10 pr-4 py-2.5 bg-canvas/60 border border-ink/15 rounded-xl text-ink placeholder:text-ink/40 focus:ring-2 focus:ring-companion/30 outline-none text-base"
          />
        </div>

        <!-- Scope Filter Dropdown -->
        <div class="sm:w-52">
          <select
            [ngModel]="selectedScopeFilter()"
            (ngModelChange)="onScopeFilterChange($event)"
            class="w-full tap-target px-3.5 py-2.5 bg-canvas/60 border border-ink/15 rounded-xl text-ink font-medium focus:ring-2 focus:ring-companion/30 outline-none text-base"
          >
            <option value="all">All Scope</option>
            <option value="national">National Helplines</option>
            <option value="international">International Helplines</option>
            <option value="local">Local Emergency</option>
          </select>
        </div>
      </div>

      <!-- Helpline Cards Grid -->
      @if (filteredHelplines().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (item of filteredHelplines(); track item.id) {
            <div class="journal-card p-6 flex flex-col justify-between hover:border-ink/20 transition-all">
              <div>
                <!-- Header & Scope badge -->
                <div class="flex items-start justify-between gap-3 mb-2">
                  <h3 class="text-xl font-bold text-ink font-serif-header">{{ item.name }}</h3>
                  
                  <span [ngClass]="getBadgeClass(item.scope)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    {{ item.scope }}
                  </span>
                </div>

                @if (item.area) {
                  <p class="text-sm font-semibold text-companion flex items-center gap-1.5 mb-3">
                    <svg class="w-4 h-4 text-warmth flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ item.area }}
                  </p>
                }

                @if (item.notes) {
                  <p class="text-sm text-ink/80 leading-relaxed mb-4 italic">
                    "{{ item.notes }}"
                  </p>
                }
              </div>

              <!-- Footer Phone call button & Edit -->
              <div class="pt-4 border-t border-ink/10 flex items-center justify-between gap-2">
                @if (item.phone === 'VERIFY BEFORE USE') {
                  <span class="px-3 py-1 bg-tender/20 text-ink border border-tender/40 rounded-lg text-xs font-bold uppercase tracking-wider">
                    VERIFY BEFORE USE
                  </span>
                } @else {
                  <a 
                    [href]="'tel:' + item.phone" 
                    class="tap-target px-4 py-2 bg-companion hover:bg-companion/90 text-canvas rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Call {{ item.phone }}
                  </a>
                }

                @if (currentUser()) {
                  <button 
                    (click)="openEditModal(item)"
                    class="tap-target px-3.5 py-2 text-xs font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 rounded-xl transition-colors"
                  >
                    Edit
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          title="No helplines added yet"
          message="No helpline numbers added yet. Add the first crisis or support line your family trusts."
          [actionLabel]="currentUser() ? 'Add First Helpline' : undefined"
          (action)="openAddModal()"
        ></app-empty-state>
      }
    </div>

    <!-- Modals -->
    @if (showFormModal()) {
      <app-helpline-form
        [editHelpline]="selectedHelpline()"
        (close)="closeFormModal()"
      ></app-helpline-form>
    }

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class HelplineListComponent {
  private helplineService = inject(HelplineService);
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly filteredHelplines = this.helplineService.filteredHelplines;
  readonly searchQuery = this.helplineService.searchQuery;
  readonly selectedScopeFilter = this.helplineService.selectedScopeFilter;

  readonly showFormModal = signal<boolean>(false);
  readonly showAuthModal = signal<boolean>(false);
  readonly selectedHelpline = signal<Helpline | undefined>(undefined);

  onSearchChange(value: string) {
    this.helplineService.searchQuery.set(value);
  }

  onScopeFilterChange(value: string) {
    this.helplineService.selectedScopeFilter.set(value);
  }

  openAddModal() {
    this.selectedHelpline.set(undefined);
    this.showFormModal.set(true);
  }

  openEditModal(item: Helpline) {
    this.selectedHelpline.set(item);
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.selectedHelpline.set(undefined);
  }

  getBadgeClass(scope: HelplineScope): string {
    switch (scope) {
      case 'national':
        return 'bg-companion/15 text-companion border border-companion/30';
      case 'international':
        return 'bg-warmth/20 text-ink border border-warmth/40';
      case 'local':
        return 'bg-hearth/25 text-ink border border-hearth/50';
    }
  }
}
