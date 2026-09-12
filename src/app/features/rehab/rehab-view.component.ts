import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RehabService } from '../../core/services/rehab.service';
import { RehabFormModalComponent } from './rehab-form-modal.component';

@Component({
  selector: 'app-rehab-view',
  standalone: true,
  imports: [CommonModule, RehabFormModalComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>🏃‍♂️</span>
            <span>Home Rehab & Therapy Log</span>
          </h1>
          <p class="text-sm text-ink/70 mt-1">
            Coordinate visiting physiotherapists, speech therapists, and home rehabilitation sessions.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button 
            (click)="openModal('session')"
            class="tap-target px-3.5 py-2.5 bg-companion text-canvas text-xs sm:text-sm font-semibold rounded-xl hover:bg-companion/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>📝</span>
            <span>Log Session</span>
          </button>
          <button 
            (click)="openModal('specialist')"
            class="tap-target px-3.5 py-2.5 bg-ink/10 text-ink border border-ink/20 text-xs sm:text-sm font-semibold rounded-xl hover:bg-ink/20 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Specialist</span>
          </button>
        </div>
      </div>

      <!-- Top Summary Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div class="bg-canvas border border-ink/15 rounded-2xl p-4 shadow-sm">
          <span class="text-xs uppercase tracking-wider font-semibold text-ink/60 block">Visiting Therapists</span>
          <span class="font-serif text-2xl font-bold text-ink mt-0.5 block">
            {{ specialists().length }} Specialists
          </span>
          <span class="text-xs text-ink/60 mt-1 block">
            Physio, Speech & Visiting Nurses
          </span>
        </div>

        <div class="bg-canvas border border-ink/15 rounded-2xl p-4 shadow-sm">
          <span class="text-xs uppercase tracking-wider font-semibold text-ink/60 block">Sessions Completed</span>
          <span class="font-serif text-2xl font-bold text-companion mt-0.5 block">
            {{ totalSessionsCount() }} Sessions
          </span>
          <span class="text-xs text-ink/60 mt-1 block">
            Regular daily/weekly rehabilitation
          </span>
        </div>

        <div class="bg-canvas border border-ink/15 rounded-2xl p-4 shadow-sm">
          <span class="text-xs uppercase tracking-wider font-semibold text-ink/60 block">Total Rehab Outlay</span>
          <span class="font-serif text-2xl font-bold text-warmth mt-0.5 block">
            ₹{{ totalRehabSpend() }}
          </span>
          <span class="text-xs text-ink/60 mt-1 block">
            Therapy visit fees logged
          </span>
        </div>
      </div>

      <!-- Section 1: Visiting Specialists Directory -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-ink/10 pb-3">
          <h2 class="font-serif text-lg sm:text-xl font-bold text-ink flex items-center gap-2">
            <span>👨‍⚕️</span>
            <span>Visiting Specialists & Routine Schedule</span>
          </h2>
          <span class="text-xs font-semibold text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">
            {{ specialists().length }} Active
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (spec of specialists(); track spec.id) {
            <div class="bg-canvas border border-ink/15 rounded-3xl p-5 shadow-sm space-y-3.5 hover:border-companion/40 transition-all flex flex-col justify-between">
              <div class="space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="font-serif text-base font-bold text-ink">
                      {{ spec.name }}
                    </h3>
                    <span class="bg-companion/15 text-companion text-[11px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {{ spec.specialty }}
                    </span>
                  </div>

                  <a 
                    [href]="'tel:' + spec.phone"
                    class="tap-target px-2.5 py-1.5 bg-companion text-canvas text-xs font-bold rounded-xl hover:bg-companion/90 transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>📞</span>
                    <span>Call</span>
                  </a>
                </div>

                <div class="text-xs space-y-1 bg-ink/5 p-3 rounded-2xl">
                  <div class="flex items-center justify-between">
                    <span class="text-ink/60">Schedule:</span>
                    <span class="font-bold text-ink">{{ spec.schedule_frequency }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-ink/60">Fee:</span>
                    <span class="font-bold text-companion">₹{{ spec.fee_per_visit }} / visit</span>
                  </div>
                  @if (spec.clinic_or_agency) {
                    <div class="text-ink/60 text-[11px] pt-1">
                      Agency: {{ spec.clinic_or_agency }}
                    </div>
                  }
                </div>

                @if (spec.notes) {
                  <p class="text-xs text-ink/70 leading-relaxed">
                    {{ spec.notes }}
                  </p>
                }
              </div>

              <div class="pt-2 border-t border-ink/10 flex items-center justify-between text-[11px] text-ink/60">
                <span>Phone: {{ spec.phone }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Section 2: Completed Rehabilitation Session Logs -->
      <div class="space-y-4 pt-4">
        <div class="flex items-center justify-between border-b border-ink/10 pb-3">
          <h2 class="font-serif text-lg sm:text-xl font-bold text-ink flex items-center gap-2">
            <span>📋</span>
            <span>Completed Session Logs & Exercises</span>
          </h2>
          <span class="text-xs font-semibold text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">
            {{ sessions().length }} Recorded
          </span>
        </div>

        <div class="space-y-3">
          @for (session of sessions(); track session.id) {
            <div class="bg-canvas border border-ink/15 rounded-3xl p-5 shadow-sm space-y-2.5 hover:border-ink/25 transition-all">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/10 pb-2.5">
                <div class="flex items-center gap-2.5">
                  <span class="text-lg">🎯</span>
                  <div>
                    <h3 class="font-serif text-sm sm:text-base font-bold text-ink">
                      {{ session.specialist_name }}
                    </h3>
                    <span class="text-xs text-ink/60">
                      Date: {{ session.session_date }} • Duration: {{ session.duration_minutes }} mins
                    </span>
                  </div>
                </div>

                <span class="text-xs font-bold text-warmth bg-warmth/15 px-3 py-1 rounded-full self-start sm:self-auto">
                  Fee Paid: ₹{{ session.fee_paid }}
                </span>
              </div>

              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-ink/60 block mb-0.5">
                  Exercises / Routine Performed
                </span>
                <p class="text-xs sm:text-sm text-ink/80 leading-relaxed bg-ink/5 p-3 rounded-2xl">
                  {{ session.exercises_summary }}
                </p>
              </div>

              @if (session.caregiver_notes) {
                <div class="text-xs text-companion font-medium flex items-center gap-1.5 pt-1">
                  <span>💡 Observation:</span>
                  <span>{{ session.caregiver_notes }}</span>
                </div>
              }
            </div>
          } @empty {
            <div class="text-center py-8 text-ink/50 text-xs bg-canvas border border-ink/10 rounded-2xl">
              No therapy sessions recorded yet.
            </div>
          }
        </div>
      </div>

    </div>

    @if (showModal()) {
      <app-rehab-form-modal (close)="showModal.set(false)"></app-rehab-form-modal>
    }
  `
})
export class RehabViewComponent {
  private rehabService = inject(RehabService);

  readonly specialists = this.rehabService.specialists;
  readonly sessions = this.rehabService.sessions;
  readonly totalSessionsCount = this.rehabService.totalSessionsCount;
  readonly totalRehabSpend = this.rehabService.totalRehabSpend;

  readonly showModal = signal<boolean>(false);

  openModal(mode: 'session' | 'specialist') {
    this.showModal.set(true);
  }
}
