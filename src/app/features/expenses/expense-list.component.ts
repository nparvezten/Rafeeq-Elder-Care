import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { ExpenseFormComponent } from './expense-form.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AuthModalComponent } from '../auth/auth-modal.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, CurrencyInrPipe, ExpenseFormComponent, EmptyStateComponent, AuthModalComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Section Header & Log Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header">Shared Expense Tracker</h1>
          <p class="text-ink/80 text-base mt-0.5">
            Log eldercare costs and track balances so family cost-sharing remains transparent.
          </p>
        </div>

        <div>
          @if (currentUser()) {
            <button 
              (click)="showFormModal.set(true)"
              class="tap-target px-5 py-3 bg-companion text-canvas rounded-xl font-semibold hover:bg-companion/95 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Log New Expense
            </button>
          } @else {
            <button 
              (click)="showAuthModal.set(true)"
              class="tap-target px-5 py-3 border border-companion text-companion rounded-xl font-semibold hover:bg-companion/10 transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Sign in to Log Expense
            </button>
          }
        </div>
      </div>

      <!-- Net Balance Summary Card -->
      <div class="journal-card p-6 mb-8 bg-canvas/80 border-hearth/30">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-bold text-ink font-serif-header flex items-center gap-2">
            <svg class="w-5 h-5 text-companion" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7h6m6 1l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9h6"/>
            </svg>
            Net Balances & Settlements
          </h2>

          @if (summary().isSettled) {
            <span class="px-3 py-1 bg-hearth/30 text-ink border border-hearth/50 rounded-full text-xs font-bold uppercase tracking-wider">
              Everyone's settled up
            </span>
          }
        </div>

        @if (summary().isSettled) {
          <div class="p-4 bg-hearth/15 border border-hearth/40 rounded-xl text-center">
            <p class="text-base font-semibold text-ink">Everyone's settled up</p>
            <p class="text-sm text-ink/80 mt-0.5">All logged expenses have been split evenly without remaining debts.</p>
          </div>
        } @else {
          <!-- Member Net Status Badges -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            @for (m of summary().memberBalances; track m.name) {
              <div class="p-3.5 rounded-xl border bg-white/70 flex flex-col justify-between"
                   [ngClass]="{
                     'border-hearth/50 bg-hearth/10': m.netBalance > 0,
                     'border-tender/40 bg-tender/10': m.netBalance < 0,
                     'border-ink/10': m.netBalance === 0
                   }">
                <span class="text-sm font-semibold text-ink">{{ m.name }}</span>
                <span class="text-lg font-bold mt-1"
                      [ngClass]="{
                        'text-companion': m.netBalance > 0,
                        'text-ink': m.netBalance < 0,
                        'text-ink/60': m.netBalance === 0
                      }">
                  @if (m.netBalance > 0) {
                    {{ m.name }} is owed {{ m.netBalance | currencyInr }}
                  } @else if (m.netBalance < 0) {
                    {{ m.name }} owes {{ (m.netBalance * -1) | currencyInr }}
                  } @else {
                    Settled
                  }
                </span>
              </div>
            }
          </div>

          <!-- Direct Settlement Suggestions (Who owes whom) -->
          @if (summary().debtPairs.length > 0) {
            <div class="pt-4 border-t border-ink/10">
              <h3 class="text-xs uppercase tracking-wider font-bold text-ink/70 mb-3">Settlement Suggestions</h3>
              <div class="space-y-2">
                @for (pair of summary().debtPairs; track pair.from + pair.to) {
                  <div class="flex items-center justify-between p-3 bg-white/90 rounded-xl border border-ink/10 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-ink">{{ pair.from }}</span>
                      <span class="text-ink/60 text-xs">pays</span>
                      <span class="font-bold text-ink">{{ pair.to }}</span>
                    </div>
                    <span class="font-bold text-companion bg-companion/10 px-3 py-1 rounded-lg">
                      {{ pair.amount | currencyInr }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Expense History List -->
      <h2 class="text-xl font-bold text-ink font-serif-header mb-4">Expense History</h2>

      @if (expenses().length > 0) {
        <div class="space-y-4">
          @for (exp of expenses(); track exp.id) {
            <div class="journal-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1.5 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-semibold text-ink/60 uppercase tracking-wider">
                    {{ exp.date }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-warmth/15 text-ink border border-warmth/30">
                    {{ exp.category }}
                  </span>
                </div>

                <h3 class="text-lg font-bold text-ink font-serif-header">{{ exp.description }}</h3>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/80 pt-1">
                  <span>Paid by: <strong class="text-ink">{{ exp.paid_by }}</strong></span>
                  <span class="text-ink/30">•</span>
                  <div class="flex items-center gap-1 flex-wrap">
                    <span>Split between:</span>
                    @for (member of exp.split_between; track member) {
                      <span class="px-2 py-0.5 bg-canvas border border-ink/15 rounded-md text-xs font-medium text-ink">
                        {{ member }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- Amount Badge -->
              <div class="sm:text-right flex-shrink-0">
                <span class="text-2xl font-extrabold text-companion font-serif-header">
                  {{ exp.amount | currencyInr }}
                </span>
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          title="No expenses logged yet"
          message="No expenses logged yet. Record the first care expense to start tracking family cost-sharing."
          [actionLabel]="currentUser() ? 'Log First Expense' : undefined"
          (action)="showFormModal.set(true)"
        ></app-empty-state>
      }
    </div>

    <!-- Modals -->
    @if (showFormModal()) {
      <app-expense-form (close)="showFormModal.set(false)"></app-expense-form>
    }

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)"></app-auth-modal>
    }
  `
})
export class ExpenseListComponent {
  private expenseService = inject(ExpenseService);
  private supabaseService = inject(SupabaseService);

  readonly currentUser = this.supabaseService.currentUser;
  readonly expenses = this.expenseService.expenses;
  readonly summary = this.expenseService.summary;

  readonly showFormModal = signal<boolean>(false);
  readonly showAuthModal = signal<boolean>(false);
}
