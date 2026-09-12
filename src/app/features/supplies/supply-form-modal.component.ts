import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliesService } from '../../core/services/supplies.service';
import { CareSupply } from '../../core/models/supplies.model';

@Component({
  selector: 'app-supply-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-canvas border border-ink/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between border-b border-ink/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📦</span>
            <h3 class="font-serif text-lg font-bold text-ink">Add Consumable Supply</h3>
          </div>
          <button 
            (click)="close.emit()" 
            class="tap-target text-ink/50 hover:text-ink text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form (ngSubmit)="submitSupply()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Supply Item Name
            </label>
            <input 
              type="text" 
              [(ngModel)]="name" 
              name="name" 
              required
              placeholder="e.g., Adult Diapers (Large)"
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Category
              </label>
              <select 
                [(ngModel)]="category" 
                name="category"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              >
                <option value="diapers">Adult Diapers</option>
                <option value="underpads">Underpads (Sheets)</option>
                <option value="hygiene">Wipes & Gloves</option>
                <option value="wound_skin">Creams & Skin Care</option>
                <option value="feeding">Feeding & Nutrition</option>
                <option value="general">General Care</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Unit
              </label>
              <input 
                type="text" 
                [(ngModel)]="unit" 
                name="unit" 
                placeholder="e.g., pcs / packs / tubes"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Current Stock Qty
              </label>
              <input 
                type="number" 
                [(ngModel)]="quantity" 
                name="quantity" 
                min="0"
                required
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Low-Stock Threshold
              </label>
              <input 
                type="number" 
                [(ngModel)]="threshold" 
                name="threshold" 
                min="0"
                required
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Brand / Manufacturer (Optional)
            </label>
            <input 
              type="text" 
              [(ngModel)]="brand" 
              name="brand" 
              placeholder="e.g., Friends / Dignity / Clensta"
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Notes
            </label>
            <input 
              type="text" 
              [(ngModel)]="notes" 
              name="notes" 
              placeholder="e.g., Buy from pharmacy near clinic for 15% discount."
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
              [disabled]="isSubmitting() || !name.trim()"
              class="tap-target px-5 py-2.5 bg-companion text-canvas text-sm font-semibold rounded-xl hover:bg-companion/90 disabled:opacity-50 shadow-sm transition-all"
            >
              @if (isSubmitting()) {
                Saving...
              } @else {
                Save Supply Item
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SupplyFormModalComponent {
  @Output() close = new EventEmitter<void>();

  private suppliesService = inject(SuppliesService);

  name = '';
  category: CareSupply['category'] = 'diapers';
  quantity = 10;
  unit = 'pieces';
  threshold = 5;
  brand = '';
  notes = '';
  isSubmitting = signal(false);

  async submitSupply() {
    if (!this.name.trim()) return;

    this.isSubmitting.set(true);
    try {
      await this.suppliesService.addSupply({
        name: this.name.trim(),
        category: this.category,
        quantity: Number(this.quantity),
        unit: this.unit.trim() || 'units',
        threshold: Number(this.threshold),
        brand: this.brand.trim() || undefined,
        notes: this.notes.trim() || undefined
      });

      this.close.emit();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
