import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RehabService } from '../../core/services/rehab.service';
import { SpecialistType } from '../../core/models/rehab.model';

@Component({
  selector: 'app-rehab-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-canvas border border-ink/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Tabs: Log Session vs Add Specialist -->
        <div class="flex items-center justify-between border-b border-ink/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏃‍♂️</span>
            <h3 class="font-serif text-lg font-bold text-ink">
              {{ mode === 'session' ? 'Log Rehab Session' : 'Add Rehab Specialist' }}
            </h3>
          </div>
          <button 
            (click)="close.emit()" 
            class="tap-target text-ink/50 hover:text-ink text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div class="flex items-center gap-2 bg-ink/5 p-1 rounded-xl">
          <button 
            type="button"
            (click)="mode = 'session'"
            [class.bg-canvas]="mode === 'session'"
            [class.shadow-xs]="mode === 'session'"
            [class.font-bold]="mode === 'session'"
            class="flex-1 py-1.5 text-xs text-ink rounded-lg transition-all"
          >
            Log Completed Session
          </button>
          <button 
            type="button"
            (click)="mode = 'specialist'"
            [class.bg-canvas]="mode === 'specialist'"
            [class.shadow-xs]="mode === 'specialist'"
            [class.font-bold]="mode === 'specialist'"
            class="flex-1 py-1.5 text-xs text-ink rounded-lg transition-all"
          >
            Add New Specialist
          </button>
        </div>

        <!-- FORM 1: Log Session -->
        @if (mode === 'session') {
          <form (ngSubmit)="submitSession()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Visiting Therapist / Specialist
              </label>
              <select 
                [(ngModel)]="sessionSpecialistName" 
                name="sessionSpecialistName"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              >
                @for (spec of specialists(); track spec.id) {
                  <option [value]="spec.name">{{ spec.name }} ({{ spec.specialty }})</option>
                }
                <option value="Other Visiting Therapist">Other Visiting Therapist</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Session Date
                </label>
                <input 
                  type="date" 
                  [(ngModel)]="sessionDate" 
                  name="sessionDate" 
                  required
                  class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Duration (Mins)
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="sessionDuration" 
                  name="sessionDuration" 
                  min="10"
                  class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Exercises & Routine Performed
              </label>
              <textarea 
                [(ngModel)]="exercisesSummary" 
                name="exercisesSummary" 
                rows="2"
                required
                placeholder="e.g., Passive arm/leg stretching, 10 mins assisted bedside sitting."
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-companion"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Fee Paid (₹)
              </label>
              <input 
                type="number" 
                [(ngModel)]="feePaid" 
                name="feePaid" 
                min="0"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Caregiver Observations (Optional)
              </label>
              <input 
                type="text" 
                [(ngModel)]="caregiverNotes" 
                name="caregiverNotes" 
                placeholder="e.g., Patient felt relaxed, therapist recommended 2x day ankle rotations."
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                (click)="close.emit()"
                class="tap-target px-4 py-2 text-sm text-ink/70 hover:text-ink font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="isSubmitting() || !exercisesSummary.trim()"
                class="tap-target px-5 py-2.5 bg-companion text-canvas text-sm font-semibold rounded-xl hover:bg-companion/90 disabled:opacity-50 shadow-sm transition-all"
              >
                @if (isSubmitting()) {
                  Saving...
                } @else {
                  Save Session
                }
              </button>
            </div>
          </form>
        }

        <!-- FORM 2: Add Specialist -->
        @if (mode === 'specialist') {
          <form (ngSubmit)="submitSpecialist()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Therapist / Specialist Name
              </label>
              <input 
                type="text" 
                [(ngModel)]="specialistName" 
                name="specialistName" 
                required
                placeholder="e.g., Dr. Anand Verma, PT"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Specialty
                </label>
                <select 
                  [(ngModel)]="specialty" 
                  name="specialty"
                  class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
                >
                  <option value="Physiotherapist">Physiotherapist</option>
                  <option value="Occupational Therapist">Occupational Therapist</option>
                  <option value="Speech & Swallow Therapist">Speech & Swallow</option>
                  <option value="Visiting Nurse">Visiting Nurse</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  [(ngModel)]="specialistPhone" 
                  name="specialistPhone" 
                  required
                  placeholder="e.g., +91 98765 22334"
                  class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Fee per Visit (₹)
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="feePerVisit" 
                  name="feePerVisit" 
                  min="0"
                  required
                  class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Schedule / Timing
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="scheduleFrequency" 
                  name="scheduleFrequency" 
                  placeholder="e.g., Mon to Sat @ 11:30 AM"
                  class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Clinic / Agency Name
              </label>
              <input 
                type="text" 
                [(ngModel)]="clinicName" 
                name="clinicName" 
                placeholder="e.g., Neuro-Rehab Home Services"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Notes
              </label>
              <input 
                type="text" 
                [(ngModel)]="specialistNotes" 
                name="specialistNotes" 
                placeholder="e.g., Provides gait belt and assisted limb stretching."
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                (click)="close.emit()"
                class="tap-target px-4 py-2 text-sm text-ink/70 hover:text-ink font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="isSubmitting() || !specialistName.trim() || !specialistPhone.trim()"
                class="tap-target px-5 py-2.5 bg-companion text-canvas text-sm font-semibold rounded-xl hover:bg-companion/90 disabled:opacity-50 shadow-sm transition-all"
              >
                @if (isSubmitting()) {
                  Saving...
                } @else {
                  Save Specialist
                }
              </button>
            </div>
          </form>
        }

      </div>
    </div>
  `
})
export class RehabFormModalComponent {
  @Output() close = new EventEmitter<void>();

  private rehabService = inject(RehabService);

  readonly specialists = this.rehabService.specialists;
  mode: 'session' | 'specialist' = 'session';
  isSubmitting = signal(false);

  // Session Fields
  sessionSpecialistName = this.specialists()[0]?.name || 'Dr. Anand Verma, PT';
  sessionDate = new Date().toISOString().split('T')[0];
  sessionDuration = 45;
  exercisesSummary = '';
  feePaid = 800;
  caregiverNotes = '';

  // Specialist Fields
  specialistName = '';
  specialty: SpecialistType = 'Physiotherapist';
  specialistPhone = '';
  feePerVisit = 800;
  scheduleFrequency = 'Daily @ 11:30 AM';
  clinicName = '';
  specialistNotes = '';

  async submitSession() {
    if (!this.exercisesSummary.trim()) return;

    this.isSubmitting.set(true);
    try {
      await this.rehabService.logSession({
        specialist_name: this.sessionSpecialistName,
        session_date: this.sessionDate,
        duration_minutes: Number(this.sessionDuration),
        exercises_summary: this.exercisesSummary.trim(),
        fee_paid: Number(this.feePaid),
        caregiver_notes: this.caregiverNotes.trim() || undefined
      });

      this.close.emit();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async submitSpecialist() {
    if (!this.specialistName.trim() || !this.specialistPhone.trim()) return;

    this.isSubmitting.set(true);
    try {
      await this.rehabService.addSpecialist({
        name: this.specialistName.trim(),
        specialty: this.specialty,
        phone: this.specialistPhone.trim(),
        fee_per_visit: Number(this.feePerVisit),
        schedule_frequency: this.scheduleFrequency.trim(),
        clinic_or_agency: this.clinicName.trim() || undefined,
        notes: this.specialistNotes.trim() || undefined
      });

      this.close.emit();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
