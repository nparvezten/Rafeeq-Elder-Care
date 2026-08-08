import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosticCenter, DiagnosticCategory } from '../../core/models/diagnostic.model';
import { DiagnosticService } from '../../core/services/diagnostic.service';

@Component({
  selector: 'app-diagnostic-form',
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

        <h2 class="text-2xl font-bold text-ink mb-1 font-serif-header">
          {{ editCenter ? 'Edit Diagnostic Center' : 'Add Diagnostic Center' }}
        </h2>
        <p class="text-ink/80 text-sm mb-6">
          Record government schemes, subsidized health facilities, or trusted low-cost diagnostic labs.
        </p>

        @if (errorMessage()) {
          <div class="p-3 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-4 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="save()" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-semibold text-ink mb-1">Center / Facility Name *</label>
            <input 
              id="name"
              type="text" 
              [(ngModel)]="form.name" 
              name="name"
              placeholder="e.g. Al-Khidmat Subsidized Health Lab"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="category" class="block text-sm font-semibold text-ink mb-1">Category *</label>
              <select 
                id="category"
                [(ngModel)]="form.category" 
                name="category"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              >
                <option value="government">Government Facility</option>
                <option value="subsidized">Subsidized / Welfare</option>
                <option value="low-cost-private">Low-Cost Private Lab</option>
              </select>
            </div>

            <div>
              <label for="area" class="block text-sm font-semibold text-ink mb-1">Locality / Area *</label>
              <input 
                id="area"
                type="text" 
                [(ngModel)]="form.area" 
                name="area"
                placeholder="e.g. Model Town"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label for="services" class="block text-sm font-semibold text-ink mb-1">Diagnostic Services Offered *</label>
            <input 
              id="services"
              type="text" 
              [(ngModel)]="form.services" 
              name="services"
              placeholder="e.g. CBC, HbA1c, Lipid Profile, Chest X-Ray, ECG"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div>
            <label for="contact" class="block text-sm font-semibold text-ink mb-1">Contact Number / Helpline</label>
            <input 
              id="contact"
              type="text" 
              [(ngModel)]="form.contact" 
              name="contact"
              placeholder="e.g. 042-35850911"
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div>
            <label for="notes" class="block text-sm font-semibold text-ink mb-1">Timing & Notes</label>
            <textarea 
              id="notes"
              [(ngModel)]="form.notes" 
              name="notes"
              rows="3"
              placeholder="Free with CNIC, home sample collection, discounts for senior citizens..."
              class="w-full px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            ></textarea>
          </div>

          <div class="pt-3 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              [disabled]="isSaving()"
              class="flex-1 tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ isSaving() ? 'Saving...' : (editCenter ? 'Update Center' : 'Add Diagnostic Center') }}
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
export class DiagnosticFormComponent {
  private diagnosticService = inject(DiagnosticService);

  @Input() editCenter?: DiagnosticCenter;
  @Output() close = new EventEmitter<void>();

  form: Omit<DiagnosticCenter, 'id' | 'created_at'> = {
    name: '',
    category: 'subsidized',
    area: '',
    services: '',
    contact: '',
    notes: ''
  };

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    if (this.editCenter) {
      this.form = {
        name: this.editCenter.name,
        category: this.editCenter.category,
        area: this.editCenter.area,
        services: this.editCenter.services,
        contact: this.editCenter.contact || '',
        notes: this.editCenter.notes || ''
      };
    }
  }

  async save() {
    if (!this.form.name || !this.form.area || !this.form.services) {
      this.errorMessage.set('Please fill in Name, Area, and Services offered.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    let res;
    if (this.editCenter && this.editCenter.id) {
      res = await this.diagnosticService.updateCenter(this.editCenter.id, this.form);
    } else {
      res = await this.diagnosticService.addCenter(this.form);
    }

    this.isSaving.set(false);
    if (res.error) {
      this.errorMessage.set(res.error.message || 'Unable to save center details.');
    } else {
      this.close.emit();
    }
  }
}
