import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendantService } from '../../core/services/attendant.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Attendant, ServiceType } from '../../core/models/attendant.model';
import { AttendantFormComponent } from './attendant-form.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AuthModalComponent } from '../auth/auth-modal.component';

@Component({
  selector: 'app-attendant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AttendantFormComponent, EmptyStateComponent, AuthModalComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Section Header & Add Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Attendant Directory</h1>
          <p class="text-ink/80 text-base mt-0.5">
            Vetted care attendants, home nurses, and doctors trusted by your family.
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
              Add Attendant
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
            placeholder="Search by name, area, or notes..."
            class="w-full tap-target pl-10 pr-4 py-2.5 bg-canvas/60 border border-ink/15 rounded-xl text-ink placeholder:text-ink/40 focus:ring-2 focus:ring-companion/30 outline-none text-base"
          />
        </div>

        <!-- Service Type Dropdown -->
        <div class="sm:w-52">
          <select
            [ngModel]="selectedTypeFilter()"
            (ngModelChange)="onTypeFilterChange($event)"
            class="w-full tap-target px-3.5 py-2.5 bg-canvas/60 border border-ink/15 rounded-xl text-ink font-medium focus:ring-2 focus:ring-companion/30 outline-none text-base"
          >
            <option value="all">All Service Types</option>
            <option value="nurse">Nurse</option>
            <option value="doctor">Doctor</option>
            <option value="attendant">Attendant</option>
            <option value="other">Other Specialist</option>
          </select>
        </div>
      </div>

      <!-- Attendant Cards List -->
      @if (filteredAttendants().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (item of filteredAttendants(); track item.id) {
            <div class="journal-card p-6 flex flex-col justify-between hover:border-ink/20 transition-all">
              <div>
                <!-- Header with name & service badge -->
                <div class="flex items-start justify-between gap-3 mb-2">
                  <h3 class="text-xl font-bold text-ink font-serif-header">{{ item.name }}</h3>
                  
                  <span [ngClass]="getBadgeClass(item.service_type)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    {{ item.service_type }}
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

                <!-- Rate info -->
                @if (item.rate_info) {
                  <p class="text-sm text-ink/90 font-medium mb-3 bg-canvas/70 px-3 py-1.5 rounded-lg border border-ink/10 inline-block">
                    Rate: {{ item.rate_info }}
                  </p>
                }

                <!-- Notes -->
                @if (item.notes) {
                  <p class="text-sm text-ink/80 leading-relaxed mb-4 italic">
                    "{{ item.notes }}"
                  </p>
                }
              </div>

              <!-- Footer Edit Button -->
              @if (currentUser()) {
                <div class="pt-4 border-t border-ink/10 flex items-center justify-end">
                  <button 
                    (click)="openEditModal(item)"
                    class="tap-target px-4 py-2 text-xs font-semibold text-companion bg-companion/10 hover:bg-companion/20 rounded-xl transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          title="No care attendants listed yet"
          message="No one added yet. Add the first person your family trusts to help."
          [actionLabel]="currentUser() ? 'Add First Attendant' : undefined"
          (action)="openAddModal()"
        ></app-empty-state>
      }
    </div>

    <!-- Modals -->
    @if (showFormModal()) {
      <app-attendant-form
        [editAttendant]="selectedAttendant()"
        (close)="closeFormModal()"
      ></app-attendant-form>
    }

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class AttendantListComponent {
  private attendantService = inject(AttendantService);
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly filteredAttendants = this.attendantService.filteredAttendants;
  readonly searchQuery = this.attendantService.searchQuery;
  readonly selectedTypeFilter = this.attendantService.selectedTypeFilter;

  readonly showFormModal = signal<boolean>(false);
  readonly showAuthModal = signal<boolean>(false);
  readonly selectedAttendant = signal<Attendant | undefined>(undefined);

  onSearchChange(value: string) {
    this.attendantService.searchQuery.set(value);
  }

  onTypeFilterChange(value: string) {
    this.attendantService.selectedTypeFilter.set(value);
  }

  openAddModal() {
    this.selectedAttendant.set(undefined);
    this.showFormModal.set(true);
  }

  openEditModal(attendant: Attendant) {
    this.selectedAttendant.set(attendant);
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.selectedAttendant.set(undefined);
  }

  getBadgeClass(type: ServiceType): string {
    switch (type) {
      case 'nurse':
        return 'bg-companion/15 text-companion border border-companion/30';
      case 'doctor':
        return 'bg-warmth/20 text-ink border border-warmth/40';
      case 'attendant':
        return 'bg-hearth/25 text-ink border border-hearth/50';
      default:
        return 'bg-tender/20 text-ink border border-tender/40';
    }
  }
}
