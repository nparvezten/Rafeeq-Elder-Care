import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutineService } from '../../core/services/routine.service';
import { RoutineFormModalComponent } from './routine-form-modal.component';
import { PatientPosition } from '../../core/models/routine.model';

@Component({
  selector: 'app-routine-view',
  standalone: true,
  imports: [CommonModule, RoutineFormModalComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      <!-- Bedside Quick-Call Emergency Bar -->
      <div class="bg-tender/15 border border-tender/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl animate-pulse">🚨</span>
          <div>
            <h4 class="text-sm font-bold text-ink">Bedside Emergency Quick-Dial</h4>
            <p class="text-xs text-ink/70">Instant 1-tap emergency support for caregivers on duty</p>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <a 
            href="tel:108"
            class="flex-1 sm:flex-none text-center tap-target px-3.5 py-2 bg-tender text-canvas text-xs font-bold rounded-xl hover:bg-tender/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>🚑 Ambulance (108)</span>
          </a>
          <a 
            href="tel:14567"
            class="flex-1 sm:flex-none text-center tap-target px-3.5 py-2 bg-companion text-canvas text-xs font-bold rounded-xl hover:bg-companion/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>📞 Elder Line (14567)</span>
          </a>
        </div>
      </div>

      <!-- Header & Intro -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>🛏️</span>
            <span>Bedside Routine & Shift Care</span>
          </h1>
          <p class="text-sm text-ink/70 mt-1">
            2-hour turning schedule, daily hygiene checklist, and shift handovers for bedridden care.
          </p>
        </div>
        
        <button 
          (click)="showLogModal.set(true)"
          class="tap-target px-4 py-2.5 bg-companion text-canvas text-sm font-semibold rounded-xl hover:bg-companion/90 transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>Log Care Activity</span>
        </button>
      </div>

      <!-- Bedside Position & Turning Schedule Status Card -->
      <div class="bg-gradient-to-br from-hearth/20 via-canvas to-warmth/10 border-2 border-hearth/40 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <div>
            <span class="text-xs uppercase tracking-wider font-bold text-companion flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-hearth animate-ping"></span>
              Bed Sore Prevention Schedule (2-Hour Cycle)
            </span>
            <h2 class="font-serif text-xl sm:text-2xl font-bold text-ink mt-1">
              Current Position: <span class="text-companion">{{ currentPosition() }}</span>
            </h2>
          </div>

          <div class="bg-canvas border border-ink/15 rounded-2xl px-4 py-2.5 text-center sm:text-right shadow-sm">
            <span class="text-xs text-ink/60 block font-medium">Last Repositioned</span>
            <span class="text-sm font-bold text-ink">{{ formattedTurnTime() }}</span>
          </div>
        </div>

        <!-- Quick 1-Tap Position Turn Buttons -->
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-ink/70 block mb-2.5">
            Quick 1-Tap Reposition (Changes schedule & logs automatically)
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button 
              (click)="quickTurn('Left Lateral')"
              [ngClass]="currentPosition() === 'Left Lateral' ? 'ring-2 ring-companion bg-companion/10' : 'bg-canvas hover:border-companion'"
              class="tap-target p-3 border border-ink/15 rounded-2xl text-left transition-all group shadow-sm"
            >
              <div class="text-lg mb-1">👈</div>
              <span class="text-xs font-bold text-ink block group-hover:text-companion">Left Lateral</span>
              <span class="text-[11px] text-ink/60">Left side with pillow</span>
            </button>

            <button 
              (click)="quickTurn('Back (Supine)')"
              [ngClass]="currentPosition() === 'Back (Supine)' ? 'ring-2 ring-companion bg-companion/10' : 'bg-canvas hover:border-companion'"
              class="tap-target p-3 border border-ink/15 rounded-2xl text-left transition-all group shadow-sm"
            >
              <div class="text-lg mb-1">⬆️</div>
              <span class="text-xs font-bold text-ink block group-hover:text-companion">Back (Supine)</span>
              <span class="text-[11px] text-ink/60">Flat with heel float</span>
            </button>

            <button 
              (click)="quickTurn('Right Lateral')"
              [ngClass]="currentPosition() === 'Right Lateral' ? 'ring-2 ring-companion bg-companion/10' : 'bg-canvas hover:border-companion'"
              class="tap-target p-3 border border-ink/15 rounded-2xl text-left transition-all group shadow-sm"
            >
              <div class="text-lg mb-1">👉</div>
              <span class="text-xs font-bold text-ink block group-hover:text-companion">Right Lateral</span>
              <span class="text-[11px] text-ink/60">Right side with pillow</span>
            </button>

            <button 
              (click)="quickTurn('Semi-Fowler (Upright)')"
              [ngClass]="currentPosition() === 'Semi-Fowler (Upright)' ? 'ring-2 ring-companion bg-companion/10' : 'bg-canvas hover:border-companion'"
              class="tap-target p-3 border border-ink/15 rounded-2xl text-left transition-all group shadow-sm"
            >
              <div class="text-lg mb-1">📐</div>
              <span class="text-xs font-bold text-ink block group-hover:text-companion">Semi-Fowler</span>
              <span class="text-[11px] text-ink/60">30° back elevation</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout: 2 Columns on Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Daily Bedside Care Checklist (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="bg-canvas border border-ink/15 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 class="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <span>✅</span>
                  <span>Daily Bedside Routine Checklist</span>
                </h3>
                <span class="text-xs text-ink/60">
                  {{ completedTasksCount() }} of {{ totalTasksCount() }} routines completed today
                </span>
              </div>
              <div class="w-10 h-10 rounded-full border-2 border-companion flex items-center justify-center font-bold text-xs text-companion bg-companion/10">
                {{ completionPercent() }}%
              </div>
            </div>

            <!-- Task Items -->
            <div class="space-y-2.5">
              @for (task of tasks(); track task.id) {
                <div 
                  (click)="toggleTask(task.id)"
                  [ngClass]="task.completed ? 'bg-hearth/15 border-hearth/40' : 'bg-canvas border-ink/15 hover:border-companion'"
                  class="p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 tap-target"
                >
                  <div class="mt-0.5">
                    @if (task.completed) {
                      <div class="w-5 h-5 rounded-lg bg-companion text-canvas flex items-center justify-center text-xs font-bold shadow-xs">
                        ✓
                      </div>
                    } @else {
                      <div class="w-5 h-5 rounded-lg border-2 border-ink/30 bg-canvas"></div>
                    }
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <span 
                        [ngClass]="task.completed ? 'line-through text-ink/60' : 'text-ink'"
                        class="text-sm font-bold"
                      >
                        {{ task.title }}
                      </span>
                      @if (task.suggestedTime) {
                        <span class="text-[11px] font-semibold text-ink/50 bg-ink/5 px-2 py-0.5 rounded-md shrink-0">
                          {{ task.suggestedTime }}
                        </span>
                      }
                    </div>
                    <p class="text-xs text-ink/70 mt-0.5 leading-relaxed">
                      {{ task.description }}
                    </p>
                    @if (task.completed && task.completedBy) {
                      <span class="text-[11px] font-medium text-companion block mt-1">
                        ✓ Done at {{ task.completedAt }} by {{ task.completedBy }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right: Shift Handover & Activity Timeline (5 Cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-canvas border border-ink/15 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 class="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <span>🕒</span>
                <span>Shift Handover Timeline</span>
              </h3>
              <span class="text-xs font-semibold text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">
                {{ logs().length }} Logs
              </span>
            </div>

            <p class="text-xs text-ink/60">
              Clear record of when attendants or family performed care activities.
            </p>

            <!-- Activity List -->
            <div class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              @for (log of logs(); track log.id) {
                <div class="p-3 bg-canvas/80 border border-ink/10 rounded-2xl space-y-1 relative pl-3.5 hover:border-ink/25 transition-all">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-ink">
                      {{ log.title }}
                    </span>
                    <span class="text-[10px] font-semibold text-ink/50 shrink-0">
                      {{ formatLogTime(log.logged_at) }}
                    </span>
                  </div>
                  @if (log.details) {
                    <p class="text-xs text-ink/70 leading-normal">
                      {{ log.details }}
                    </p>
                  }
                  <div class="flex items-center justify-between pt-1 text-[11px] text-companion font-medium">
                    <span>By: {{ log.performed_by }}</span>
                    @if (log.position) {
                      <span class="bg-hearth/20 px-2 py-0.5 rounded-md text-[10px] text-ink font-semibold">
                        {{ log.position }}
                      </span>
                    }
                  </div>
                </div>
              } @empty {
                <div class="text-center py-8 text-ink/50 text-xs">
                  No activity logged yet today.
                </div>
              }
            </div>
          </div>
        </div>

      </div>

    </div>

    @if (showLogModal()) {
      <app-routine-form-modal (close)="showLogModal.set(false)"></app-routine-form-modal>
    }
  `
})
export class RoutineViewComponent {
  private routineService = inject(RoutineService);

  readonly tasks = this.routineService.tasks;
  readonly logs = this.routineService.logs;
  readonly currentPosition = this.routineService.currentPosition;
  readonly lastTurnedAt = this.routineService.lastTurnedAt;
  readonly completedTasksCount = this.routineService.completedTasksCount;
  readonly totalTasksCount = this.routineService.totalTasksCount;

  readonly showLogModal = signal<boolean>(false);

  readonly completionPercent = computed(() => {
    const total = this.totalTasksCount();
    if (total === 0) return 0;
    return Math.round((this.completedTasksCount() / total) * 100);
  });

  formattedTurnTime = computed(() => {
    const timeStr = this.lastTurnedAt();
    if (!timeStr) return 'Not yet recorded';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  async quickTurn(position: PatientPosition) {
    await this.routineService.turnPatient(position, 'Caregiver on duty');
  }

  toggleTask(taskId: string) {
    this.routineService.toggleTask(taskId, 'Caregiver on duty');
  }

  formatLogTime(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
