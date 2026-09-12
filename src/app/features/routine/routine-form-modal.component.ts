import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutineService } from '../../core/services/routine.service';
import { CareRoutineLog, PatientPosition } from '../../core/models/routine.model';

@Component({
  selector: 'app-routine-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-canvas border border-ink/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between border-b border-ink/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📝</span>
            <h3 class="font-serif text-lg font-bold text-ink">Log Care Activity</h3>
          </div>
          <button 
            (click)="close.emit()" 
            class="tap-target text-ink/50 hover:text-ink text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form (ngSubmit)="submitLog()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Activity Type
            </label>
            <select 
              [(ngModel)]="activityType" 
              name="activityType"
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion focus:ring-1 focus:ring-companion"
            >
              <option value="position_turn">🔄 Position Turn (Bed Sore Prevention)</option>
              <option value="sponge_bath">🛁 Sponge Bath & Clean Bedding</option>
              <option value="diaper_change">🩲 Diaper & Underpad Change</option>
              <option value="massage_skin">🧴 Back Massage & Skin Moisturizing</option>
              <option value="hydration">🥣 Hydration & Meal Support</option>
              <option value="linen_change">🛏️ Linen & Sheet Change</option>
              <option value="general_care">✨ General Care Check</option>
            </select>
          </div>

          @if (activityType === 'position_turn') {
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                New Body Position
              </label>
              <select 
                [(ngModel)]="selectedPosition" 
                name="selectedPosition"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              >
                <option value="Left Lateral">Left Lateral (Left Side)</option>
                <option value="Back (Supine)">Back (Supine / Flat)</option>
                <option value="Right Lateral">Right Lateral (Right Side)</option>
                <option value="Semi-Fowler (Upright)">Semi-Fowler (Head elevated 30-45°)</option>
              </select>
            </div>
          }

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Activity Summary / Title
            </label>
            <input 
              type="text" 
              [(ngModel)]="title" 
              name="title" 
              required
              placeholder="e.g., Turn to Right side with knee pillow support"
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Performed By (Attendant / Family Name)
            </label>
            <input 
              type="text" 
              [(ngModel)]="performedBy" 
              name="performedBy" 
              required
              placeholder="e.g., Sister Mary or Tariq"
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Caregiver Notes (Optional)
            </label>
            <textarea 
              [(ngModel)]="details" 
              name="details" 
              rows="2"
              placeholder="e.g., Patient felt relaxed, placed small pillow under ankles."
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-companion"
            ></textarea>
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
              [disabled]="isSubmitting() || !title.trim() || !performedBy.trim()"
              class="tap-target px-5 py-2.5 bg-companion text-canvas text-sm font-semibold rounded-xl hover:bg-companion/90 disabled:opacity-50 shadow-sm transition-all"
            >
              @if (isSubmitting()) {
                Saving...
              } @else {
                Save Care Log
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RoutineFormModalComponent {
  @Output() close = new EventEmitter<void>();

  private routineService = inject(RoutineService);

  activityType: CareRoutineLog['activity_type'] = 'position_turn';
  selectedPosition: PatientPosition = 'Right Lateral';
  title = 'Patient repositioned to Right Lateral';
  performedBy = '';
  details = '';
  isSubmitting = signal(false);

  async submitLog() {
    if (!this.title.trim() || !this.performedBy.trim()) return;

    this.isSubmitting.set(true);
    try {
      await this.routineService.addLogEntry({
        activity_type: this.activityType,
        title: this.title.trim(),
        details: this.details.trim() || undefined,
        position: this.activityType === 'position_turn' ? this.selectedPosition : undefined,
        performed_by: this.performedBy.trim(),
        logged_at: new Date().toISOString()
      });

      if (this.activityType === 'position_turn') {
        this.routineService.currentPosition.set(this.selectedPosition);
        this.routineService.lastTurnedAt.set(new Date().toISOString());
      }

      this.close.emit();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
