import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliesService } from '../../core/services/supplies.service';
import { EquipmentRental } from '../../core/models/supplies.model';

@Component({
  selector: 'app-equipment-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-canvas border border-ink/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-ink/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛏️</span>
            <h3 class="font-serif text-lg font-bold text-ink">Add Equipment Rental</h3>
          </div>
          <button 
            (click)="close.emit()" 
            class="tap-target text-ink/50 hover:text-ink text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form (ngSubmit)="submitEquipment()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Equipment / Machine Name
            </label>
            <input 
              type="text" 
              [(ngModel)]="equipmentName" 
              name="equipmentName" 
              required
              placeholder="e.g., Motorized Alpha Air Mattress (Ripple Bed)"
              class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Vendor Name
              </label>
              <input 
                type="text" 
                [(ngModel)]="vendorName" 
                name="vendorName" 
                required
                placeholder="e.g., City Med-Equip"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Vendor Phone
              </label>
              <input 
                type="tel" 
                [(ngModel)]="vendorPhone" 
                name="vendorPhone" 
                required
                placeholder="e.g., +91 98200 11223"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Monthly Rent (₹)
              </label>
              <input 
                type="number" 
                [(ngModel)]="monthlyRent" 
                name="monthlyRent" 
                min="0"
                required
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Deposit Paid (₹)
              </label>
              <input 
                type="number" 
                [(ngModel)]="depositAmount" 
                name="depositAmount" 
                min="0"
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Rental Start Date
              </label>
              <input 
                type="date" 
                [(ngModel)]="startDate" 
                name="startDate" 
                required
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Renewal Due Date
              </label>
              <input 
                type="date" 
                [(ngModel)]="renewalDueDate" 
                name="renewalDueDate" 
                required
                class="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-companion"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
              Vendor / Maintenance Notes
            </label>
            <input 
              type="text" 
              [(ngModel)]="notes" 
              name="notes" 
              placeholder="e.g., Free repair/replacement included if motor fails."
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
              [disabled]="isSubmitting() || !equipmentName.trim() || !vendorName.trim() || !vendorPhone.trim()"
              class="tap-target px-5 py-2.5 bg-companion text-canvas text-sm font-semibold rounded-xl hover:bg-companion/90 disabled:opacity-50 shadow-sm transition-all"
            >
              @if (isSubmitting()) {
                Saving...
              } @else {
                Save Rental Item
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EquipmentFormModalComponent {
  @Output() close = new EventEmitter<void>();

  private suppliesService = inject(SuppliesService);

  equipmentName = '';
  vendorName = '';
  vendorPhone = '';
  monthlyRent = 1500;
  depositAmount = 3000;
  startDate = new Date().toISOString().split('T')[0];
  renewalDueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  notes = '';
  isSubmitting = signal(false);

  async submitEquipment() {
    if (!this.equipmentName.trim() || !this.vendorName.trim() || !this.vendorPhone.trim()) return;

    this.isSubmitting.set(true);
    try {
      await this.suppliesService.addEquipment({
        equipment_name: this.equipmentName.trim(),
        vendor_name: this.vendorName.trim(),
        vendor_phone: this.vendorPhone.trim(),
        monthly_rent: Number(this.monthlyRent),
        deposit_amount: Number(this.depositAmount),
        start_date: this.startDate,
        renewal_due_date: this.renewalDueDate,
        status: 'active',
        notes: this.notes.trim() || undefined
      });

      this.close.emit();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
