import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuppliesService } from '../../core/services/supplies.service';
import { SupplyFormModalComponent } from './supply-form-modal.component';
import { EquipmentFormModalComponent } from './equipment-form-modal.component';

@Component({
  selector: 'app-supplies-view',
  standalone: true,
  imports: [CommonModule, RouterLink, SupplyFormModalComponent, EquipmentFormModalComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>📦</span>
            <span>Care Supplies & Equipment</span>
          </h1>
          <p class="text-sm text-ink/70 mt-1">
            Track daily consumables (diapers, underpads, wipes) and medical equipment rentals.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button 
            (click)="showSupplyModal.set(true)"
            class="tap-target px-3.5 py-2.5 bg-companion text-canvas text-xs sm:text-sm font-semibold rounded-xl hover:bg-companion/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Consumable</span>
          </button>
          <button 
            (click)="showEquipModal.set(true)"
            class="tap-target px-3.5 py-2.5 bg-warmth text-canvas text-xs sm:text-sm font-semibold rounded-xl hover:bg-warmth/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>🛏️</span>
            <span>Add Rental</span>
          </button>
        </div>
      </div>

      <!-- Low-Stock Alert Banner if any items below threshold -->
      @if (lowStockSupplies().length > 0) {
        <div class="bg-tender/15 border-2 border-tender/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-bounce">⚠️</span>
            <div>
              <h4 class="text-sm font-bold text-ink">
                Low Stock Alert: {{ lowStockSupplies().length }} item(s) running low!
              </h4>
              <p class="text-xs text-ink/70">
                Ensure timely restock so bedridden care is not interrupted.
              </p>
            </div>
          </div>
          <a 
            routerLink="/expenses" 
            class="tap-target px-3.5 py-1.5 bg-ink text-canvas text-xs font-semibold rounded-xl hover:bg-ink/90 transition-all shrink-0"
          >
            💰 Log Purchase to Expenses
          </a>
        </div>
      }

      <!-- Top Summary Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div class="bg-canvas border border-ink/15 rounded-2xl p-4 shadow-sm">
          <span class="text-xs uppercase tracking-wider font-semibold text-ink/60 block">Consumable Items</span>
          <span class="font-serif text-2xl font-bold text-ink mt-0.5 block">
            {{ supplies().length }} Tracked
          </span>
          <span class="text-xs text-ink/60 mt-1 block">
            {{ lowStockSupplies().length }} need reordering
          </span>
        </div>

        <div class="bg-canvas border border-ink/15 rounded-2xl p-4 shadow-sm">
          <span class="text-xs uppercase tracking-wider font-semibold text-ink/60 block">Active Rentals</span>
          <span class="font-serif text-2xl font-bold text-companion mt-0.5 block">
            {{ activeRentals().length }} Machines / Beds
          </span>
          <span class="text-xs text-ink/60 mt-1 block">
            Alpha beds, hospital beds & chairs
          </span>
        </div>

        <div class="bg-canvas border border-ink/15 rounded-2xl p-4 shadow-sm">
          <span class="text-xs uppercase tracking-wider font-semibold text-ink/60 block">Monthly Rental Outlay</span>
          <span class="font-serif text-2xl font-bold text-warmth mt-0.5 block">
            ₹{{ totalMonthlyRent() }} / mo
          </span>
          <span class="text-xs text-ink/60 mt-1 block">
            Split across family caregivers
          </span>
        </div>
      </div>

      <!-- Navigation Tabs for Views -->
      <div class="flex items-center gap-2 border-b border-ink/10 pb-2">
        <button 
          (click)="activeTab.set('consumables')"
          [ngClass]="activeTab() === 'consumables' ? 'bg-companion text-canvas' : 'bg-ink/5 text-ink'"
          class="tap-target px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all"
        >
          🧴 Consumable Inventory ({{ supplies().length }})
        </button>

        <button 
          (click)="activeTab.set('rentals')"
          [ngClass]="activeTab() === 'rentals' ? 'bg-companion text-canvas' : 'bg-ink/5 text-ink'"
          class="tap-target px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all"
        >
          🛏️ Equipment & Rentals ({{ equipment().length }})
        </button>
      </div>

      <!-- Tab Content: Consumables -->
      @if (activeTab() === 'consumables') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (item of supplies(); track item.id) {
            <div 
              class="bg-canvas border rounded-3xl p-5 shadow-sm space-y-3.5 transition-all"
              [ngClass]="item.quantity <= item.threshold ? 'border-tender/50 bg-tender/5' : 'border-ink/15'"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-serif text-base font-bold text-ink">
                      {{ item.name }}
                    </h3>
                    @if (item.quantity <= item.threshold) {
                      <span class="bg-tender text-canvas text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Low Stock
                      </span>
                    } @else {
                      <span class="bg-hearth/25 text-ink text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Adequate
                      </span>
                    }
                  </div>
                  @if (item.brand) {
                    <span class="text-xs text-ink/60 font-medium block mt-0.5">
                      Brand: {{ item.brand }}
                    </span>
                  }
                </div>

                <!-- Stock Counter Adjuster -->
                <div class="flex items-center gap-1.5 bg-canvas border border-ink/20 rounded-xl p-1 shadow-xs shrink-0">
                  <button 
                    (click)="updateStock(item.id, -1)" 
                    class="tap-target w-7 h-7 rounded-lg bg-ink/5 hover:bg-ink/15 text-ink font-bold text-sm flex items-center justify-center transition-all"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-sm font-bold text-ink">
                    {{ item.quantity }}
                  </span>
                  <button 
                    (click)="updateStock(item.id, 1)" 
                    class="tap-target w-7 h-7 rounded-lg bg-ink/5 hover:bg-ink/15 text-ink font-bold text-sm flex items-center justify-center transition-all"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              @if (item.notes) {
                <p class="text-xs text-ink/70 bg-ink/5 p-2.5 rounded-xl leading-relaxed">
                  {{ item.notes }}
                </p>
              }

              <div class="flex items-center justify-between pt-1 border-t border-ink/10 text-xs text-ink/60">
                <span>Alert at: &le; {{ item.threshold }} {{ item.unit }}</span>
                <span class="capitalize">{{ item.category.replace('_', ' ') }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab Content: Equipment & Rentals -->
      @if (activeTab() === 'rentals') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (equip of equipment(); track equip.id) {
            <div class="bg-canvas border border-ink/15 rounded-3xl p-5 shadow-sm space-y-3.5 hover:border-companion/40 transition-all">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-serif text-base font-bold text-ink">
                    {{ equip.equipment_name }}
                  </h3>
                  <span class="text-xs text-ink/60 block mt-0.5">
                    Vendor: {{ equip.vendor_name }}
                  </span>
                </div>

                <a 
                  [href]="'tel:' + equip.vendor_phone"
                  class="tap-target px-3 py-1.5 bg-companion/10 border border-companion/30 text-companion hover:bg-companion hover:text-canvas text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0"
                >
                  <span>📞 Call</span>
                </a>
              </div>

              <!-- Rental Price & Dates Grid -->
              <div class="grid grid-cols-2 gap-2 bg-ink/5 p-3 rounded-2xl text-xs">
                <div>
                  <span class="text-ink/60 block font-medium">Monthly Rent</span>
                  <span class="font-bold text-ink text-sm">₹{{ equip.monthly_rent }} / mo</span>
                </div>
                <div>
                  <span class="text-ink/60 block font-medium">Renewal Due</span>
                  <span class="font-bold text-companion text-sm">{{ equip.renewal_due_date }}</span>
                </div>
              </div>

              @if (equip.notes) {
                <p class="text-xs text-ink/70 leading-relaxed">
                  {{ equip.notes }}
                </p>
              }

              <div class="flex items-center justify-between pt-1 border-t border-ink/10 text-[11px] text-ink/60">
                <span>Deposit: ₹{{ equip.deposit_amount }}</span>
                <span class="bg-hearth/20 px-2 py-0.5 rounded-md font-semibold text-ink uppercase text-[10px]">
                  {{ equip.status }}
                </span>
              </div>
            </div>
          }
        </div>
      }

    </div>

    @if (showSupplyModal()) {
      <app-supply-form-modal (close)="showSupplyModal.set(false)"></app-supply-form-modal>
    }

    @if (showEquipModal()) {
      <app-equipment-form-modal (close)="showEquipModal.set(false)"></app-equipment-form-modal>
    }
  `
})
export class SuppliesViewComponent {
  private suppliesService = inject(SuppliesService);

  readonly supplies = this.suppliesService.supplies;
  readonly equipment = this.suppliesService.equipment;
  readonly lowStockSupplies = this.suppliesService.lowStockSupplies;
  readonly activeRentals = this.suppliesService.activeRentals;
  readonly totalMonthlyRent = this.suppliesService.totalMonthlyRent;

  readonly activeTab = signal<'consumables' | 'rentals'>('consumables');
  readonly showSupplyModal = signal<boolean>(false);
  readonly showEquipModal = signal<boolean>(false);

  updateStock(supplyId: string, delta: number) {
    this.suppliesService.updateStock(supplyId, delta);
  }
}
