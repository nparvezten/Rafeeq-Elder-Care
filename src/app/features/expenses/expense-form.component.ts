import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Expense } from '../../core/models/expense.model';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="journal-card bg-canvas p-6 sm:p-8 max-w-lg w-full relative my-8 shadow-xl">
        <button 
          (click)="close.emit()" 
          class="absolute top-4 right-4 text-ink/60 hover:text-ink tap-target p-2 rounded-lg"
          aria-label="Close form"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h2 class="text-2xl font-bold text-ink mb-1 font-serif-header">Log Shared Expense</h2>
        <p class="text-ink/80 text-sm mb-6">
          Record care-related expenses so cost-sharing among family members stays transparent and clear.
        </p>

        @if (errorMessage()) {
          <div class="p-3 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-4 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="save()" class="space-y-4">
          <div>
            <label for="description" class="block text-sm font-semibold text-ink mb-1">Expense Description *</label>
            <input 
              id="description"
              type="text" 
              [(ngModel)]="form.description" 
              name="description"
              placeholder="e.g. Attendant Weekly Fee / Oxygen Concentrator Rental"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="amount" class="block text-sm font-semibold text-ink mb-1">Amount (₹) *</label>
              <input 
                id="amount"
                type="number" 
                min="1"
                step="any"
                [(ngModel)]="form.amount" 
                name="amount"
                placeholder="e.g. 2400"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>

            <div>
              <label for="category" class="block text-sm font-semibold text-ink mb-1">Category *</label>
              <select 
                id="category"
                [(ngModel)]="form.category" 
                name="category"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              >
                <option value="Attendant Fee">Attendant Fee</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Equipment & Home Adaptation">Equipment & Adaptation</option>
                <option value="Transit">Transit / Ambulance</option>
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Other Care Expense">Other Care Expense</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="date" class="block text-sm font-semibold text-ink mb-1">Date *</label>
              <input 
                id="date"
                type="date" 
                [(ngModel)]="form.date" 
                name="date"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>

            <div>
              <label for="paid_by" class="block text-sm font-semibold text-ink mb-1">Paid By (Family Member) *</label>
              <input 
                id="paid_by"
                type="text" 
                [(ngModel)]="form.paid_by" 
                name="paid_by"
                placeholder="e.g. Fatima"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label for="split_between" class="block text-sm font-semibold text-ink mb-1">Split Between (Comma-separated names) *</label>
            <input 
              id="split_between"
              type="text" 
              [(ngModel)]="splitBetweenInput" 
              name="split_between"
              placeholder="e.g. Fatima, Tariq, Zainab"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
            <p class="text-xs text-ink/60 mt-1">List family members who share equal parts of this cost.</p>
          </div>

          <div class="pt-3 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              [disabled]="isSaving()"
              class="flex-1 tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ isSaving() ? 'Logging expense...' : 'Log Expense' }}
            </button>
            
            <button 
              type="button" 
              (click)="close.emit()"
              class="tap-target px-5 py-3 border border-ink/20 text-ink rounded-xl font-medium hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExpenseFormComponent {
  private expenseService = inject(ExpenseService);

  @Output() close = new EventEmitter<void>();

  form: Omit<Expense, 'id' | 'created_at'> = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Attendant Fee',
    amount: 0,
    paid_by: '',
    split_between: []
  };

  splitBetweenInput: string = 'Fatima, Tariq, Zainab';

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  async save() {
    const splitList = this.splitBetweenInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (!this.form.description || !this.form.amount || this.form.amount <= 0 || !this.form.paid_by || splitList.length === 0) {
      this.errorMessage.set('Please fill in description, valid amount, payer name, and at least one member in split list.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.form.split_between = splitList;

    const res = await this.expenseService.addExpense(this.form);

    this.isSaving.set(false);
    if (res.error) {
      this.errorMessage.set(res.error.message || 'Unable to log expense.');
    } else {
      this.close.emit();
    }
  }
}
