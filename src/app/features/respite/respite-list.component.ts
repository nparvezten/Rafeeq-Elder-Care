import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RespiteService } from '../../core/services/respite.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { RespiteRequest } from '../../core/models/respite-request.model';
import { RespiteFormComponent } from './respite-form.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AuthModalComponent } from '../auth/auth-modal.component';

@Component({
  selector: 'app-respite-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RespiteFormComponent, EmptyStateComponent, AuthModalComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Section Header & Post Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Respite Care Request Board</h1>
          <p class="text-ink/80 text-base mt-0.5">
            Coordinate coverage shifts so family caregivers can rest and recharge.
          </p>
        </div>

        <div>
          @if (currentUser()) {
            <button 
              (click)="showFormModal.set(true)"
              class="tap-target px-5 py-3 bg-companion text-canvas rounded-xl font-semibold hover:bg-companion/95 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Post Coverage Request
            </button>
          } @else {
            <button 
              (click)="showAuthModal.set(true)"
              class="tap-target px-5 py-3 border border-companion text-companion rounded-xl font-semibold hover:bg-companion/10 transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Sign in to Post / Claim
            </button>
          }
        </div>
      </div>

      <!-- Total Requests Check -->
      @if (openRequests().length > 0 || claimedRequests().length > 0) {
        
        <!-- SECTION 1: Open Requests (Shown First) -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-ink font-serif-header mb-4 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-warmth inline-block"></span>
            Open Coverage Requests ({{ openRequests().length }})
          </h2>

          @if (openRequests().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (req of openRequests(); track req.id) {
                <div class="journal-card p-6 flex flex-col justify-between border-warmth/30 bg-warmth/5 hover:border-warmth/50 transition-all">
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-warmth/20 text-ink rounded-full border border-warmth/40">
                        Needed: {{ req.date }}
                      </span>
                      <span class="text-xs text-ink/60">
                        Requested by <strong class="text-ink">{{ req.requested_by }}</strong>
                      </span>
                    </div>

                    <h3 class="text-lg font-bold text-ink font-serif-header mb-2">
                      {{ req.time_range }}
                    </h3>

                    @if (req.note) {
                      <p class="text-sm text-ink/80 italic leading-relaxed mb-4">
                        "{{ req.note }}"
                      </p>
                    }
                  </div>

                  <!-- Claim Action -->
                  <div class="pt-4 border-t border-ink/10 flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold text-warmth">Open for claim</span>

                    @if (currentUser()) {
                      <button 
                        (click)="promptClaim(req)"
                        class="tap-target px-4 py-2 bg-companion text-canvas hover:bg-companion/90 rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Claim this
                      </button>
                    } @else {
                      <button 
                        (click)="showAuthModal.set(true)"
                        class="tap-target px-3.5 py-1.5 border border-ink/20 text-ink text-xs font-semibold rounded-xl hover:bg-ink/5"
                      >
                        Sign in to claim
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="journal-card p-5 text-center text-ink/70 text-sm italic">
              No open requests pending right now.
            </div>
          }
        </div>

        <!-- SECTION 2: Claimed Requests (Shown Below) -->
        <div>
          <h2 class="text-xl font-bold text-ink font-serif-header mb-4 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-hearth inline-block"></span>
            Covered & Claimed ({{ claimedRequests().length }})
          </h2>

          @if (claimedRequests().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (req of claimedRequests(); track req.id) {
                <div class="journal-card p-6 flex flex-col justify-between bg-hearth/10 border-hearth/30">
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-hearth/30 text-ink rounded-full border border-hearth/50">
                        {{ req.date }}
                      </span>
                      <span class="text-xs text-ink/60">
                        Requested by <strong class="text-ink">{{ req.requested_by }}</strong>
                      </span>
                    </div>

                    <h3 class="text-lg font-bold text-ink font-serif-header mb-2">
                      {{ req.time_range }}
                    </h3>

                    @if (req.note) {
                      <p class="text-sm text-ink/80 italic leading-relaxed mb-4">
                        "{{ req.note }}"
                      </p>
                    }
                  </div>

                  <div class="pt-4 border-t border-ink/10 flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold text-companion flex items-center gap-1">
                      <svg class="w-4 h-4 text-hearth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Covered by {{ req.claimed_by }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

      } @else {
        <app-empty-state
          title="No coverage requests right now"
          message="No coverage requests right now. Post one if you need a break."
          [actionLabel]="currentUser() ? 'Post First Request' : undefined"
          (action)="showFormModal.set(true)"
        ></app-empty-state>
      }
    </div>

    <!-- Claim Modal Prompt -->
    @if (claimingRequest()) {
      <div class="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="journal-card bg-canvas p-6 max-w-md w-full relative shadow-xl">
          <h3 class="text-xl font-bold text-ink mb-2 font-serif-header">Claim Coverage Shift</h3>
          <p class="text-sm text-ink/80 mb-4">
            You are claiming the coverage shift on <strong>{{ claimingRequest()?.date }}</strong> ({{ claimingRequest()?.time_range }}).
          </p>

          <div class="mb-4">
            <label for="claim_name" class="block text-sm font-semibold text-ink mb-1">Your Family Member Name *</label>
            <input 
              id="claim_name"
              type="text" 
              [(ngModel)]="claimantName"
              placeholder="e.g. Tariq"
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              (click)="confirmClaim()"
              [disabled]="!claimantName.trim()"
              class="flex-1 tap-target px-5 py-2.5 bg-companion text-canvas rounded-xl font-bold hover:bg-companion/95 disabled:opacity-50"
            >
              Confirm Claim
            </button>
            <button 
              (click)="claimingRequest.set(null)"
              class="tap-target px-4 py-2.5 border border-ink/20 text-ink rounded-xl font-semibold hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Forms & Auth Modals -->
    @if (showFormModal()) {
      <app-respite-form (close)="showFormModal.set(false)"></app-respite-form>
    }

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class RespiteListComponent {
  private respiteService = inject(RespiteService);
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly openRequests = this.respiteService.openRequests;
  readonly claimedRequests = this.respiteService.claimedRequests;

  readonly showFormModal = signal<boolean>(false);
  readonly showAuthModal = signal<boolean>(false);
  readonly claimingRequest = signal<RespiteRequest | null>(null);

  claimantName: string = '';

  promptClaim(req: RespiteRequest) {
    const user = this.currentUser();
    this.claimantName = user?.email?.split('@')[0] || '';
    this.claimingRequest.set(req);
  }

  async confirmClaim() {
    const req = this.claimingRequest();
    if (!req || !req.id || !this.claimantName.trim()) return;

    await this.respiteService.claimRequest(req.id, this.claimantName.trim());
    this.claimingRequest.set(null);
  }
}
