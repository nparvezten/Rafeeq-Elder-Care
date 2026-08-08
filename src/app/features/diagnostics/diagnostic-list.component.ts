import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosticService } from '../../core/services/diagnostic.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { DiagnosticCenter, DiagnosticCategory } from '../../core/models/diagnostic.model';
import { DiagnosticFormComponent } from './diagnostic-form.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AuthModalComponent } from '../auth/auth-modal.component';

@Component({
  selector: 'app-diagnostic-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DiagnosticFormComponent, EmptyStateComponent, AuthModalComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Section Header & Add Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Diagnostic & Health Scheme Directory</h1>
          <p class="text-ink/80 text-base mt-0.5">
            Government facilities, welfare trust labs, and low-cost diagnostic services.
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
              Add Center
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

      <!-- Filter Controls Bar -->
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
            placeholder="Search by facility name, area, or services..."
            class="w-full tap-target pl-10 pr-4 py-2.5 bg-canvas/60 border border-ink/15 rounded-xl text-ink placeholder:text-ink/40 focus:ring-2 focus:ring-companion/30 outline-none text-base"
          />
        </div>

        <!-- Category Dropdown -->
        <div class="sm:w-56">
          <select
            [ngModel]="selectedCategoryFilter()"
            (ngModelChange)="onCategoryFilterChange($event)"
            class="w-full tap-target px-3.5 py-2.5 bg-canvas/60 border border-ink/15 rounded-xl text-ink font-medium focus:ring-2 focus:ring-companion/30 outline-none text-base"
          >
            <option value="all">All Categories</option>
            <option value="government">Government Scheme</option>
            <option value="subsidized">Subsidized / Welfare</option>
            <option value="low-cost-private">Low-Cost Private</option>
          </select>
        </div>
      </div>

      <!-- Diagnostic Center Cards List (Reusing Directory Pattern) -->
      @if (filteredCenters().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (item of filteredCenters(); track item.id) {
            <div class="journal-card p-6 flex flex-col justify-between hover:border-ink/20 transition-all">
              <div>
                <!-- Header with name & category badge -->
                <div class="flex items-start justify-between gap-3 mb-2">
                  <h3 class="text-xl font-bold text-ink font-serif-header">{{ item.name }}</h3>
                  
                  <span [ngClass]="getBadgeClass(item.category)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    {{ formatCategoryLabel(item.category) }}
                  </span>
                </div>

                <!-- Area & Locality -->
                <p class="text-sm font-semibold text-companion flex items-center gap-1.5 mb-3">
                  <svg class="w-4 h-4 text-warmth flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ item.area }}
                </p>

                <!-- Services Offered -->
                <div class="mb-3 bg-canvas/70 p-3 rounded-xl border border-ink/10">
                  <span class="text-xs font-bold uppercase tracking-wider text-ink/60 block mb-1">Services</span>
                  <p class="text-sm text-ink/90 font-medium">
                    {{ item.services }}
                  </p>
                </div>

                <!-- Notes -->
                @if (item.notes) {
                  <p class="text-sm text-ink/80 leading-relaxed mb-4 italic">
                    "{{ item.notes }}"
                  </p>
                }
              </div>

              <!-- Footer Contact & Edit Button -->
              <div class="pt-4 border-t border-ink/10 flex items-center justify-between gap-2">
                @if (item.contact) {
                  <a 
                    [href]="'tel:' + item.contact" 
                    class="tap-target px-4 py-2 bg-companion/10 hover:bg-companion/20 text-companion rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {{ item.contact }}
                  </a>
                } @else {
                  <span class="text-xs text-ink/50 italic">No contact listed</span>
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
          title="No diagnostic centers added yet"
          message="No centers added yet. Add the first one your family has found and trusts."
          [actionLabel]="currentUser() ? 'Add First Center' : undefined"
          (action)="openAddModal()"
        ></app-empty-state>
      }
    </div>

    <!-- Modals -->
    @if (showFormModal()) {
      <app-diagnostic-form
        [editCenter]="selectedCenter()"
        (close)="closeFormModal()"
      ></app-diagnostic-form>
    }

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class DiagnosticListComponent {
  private diagnosticService = inject(DiagnosticService);
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly filteredCenters = this.diagnosticService.filteredCenters;
  readonly searchQuery = this.diagnosticService.searchQuery;
  readonly selectedCategoryFilter = this.diagnosticService.selectedCategoryFilter;

  readonly showFormModal = signal<boolean>(false);
  readonly showAuthModal = signal<boolean>(false);
  readonly selectedCenter = signal<DiagnosticCenter | undefined>(undefined);

  onSearchChange(value: string) {
    this.diagnosticService.searchQuery.set(value);
  }

  onCategoryFilterChange(value: string) {
    this.diagnosticService.selectedCategoryFilter.set(value);
  }

  openAddModal() {
    this.selectedCenter.set(undefined);
    this.showFormModal.set(true);
  }

  openEditModal(center: DiagnosticCenter) {
    this.selectedCenter.set(center);
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.selectedCenter.set(undefined);
  }

  formatCategoryLabel(cat: DiagnosticCategory): string {
    switch (cat) {
      case 'government': return 'Govt Scheme';
      case 'subsidized': return 'Subsidized';
      case 'low-cost-private': return 'Low-Cost Private';
    }
  }

  getBadgeClass(cat: DiagnosticCategory): string {
    switch (cat) {
      case 'government':
        return 'bg-hearth/25 text-ink border border-hearth/50';
      case 'subsidized':
        return 'bg-companion/15 text-companion border border-companion/30';
      case 'low-cost-private':
        return 'bg-warmth/20 text-ink border border-warmth/40';
    }
  }
}
