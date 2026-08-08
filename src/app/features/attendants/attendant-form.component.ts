import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attendant, ServiceType } from '../../core/models/attendant.model';
import { AttendantService } from '../../core/services/attendant.service';

@Component({
  selector: 'app-attendant-form',
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
          {{ editAttendant ? 'Edit Attendant Details' : 'Add Care Attendant' }}
        </h2>
        <p class="text-ink/80 text-sm mb-6">
          Record service information for trusted home-visit nurses, doctors, or care attendants.
        </p>

        @if (errorMessage()) {
          <div class="p-3 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-4 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="save()" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-semibold text-ink mb-1">Full Name *</label>
            <input 
              id="name"
              type="text" 
              [(ngModel)]="form.name" 
              name="name"
              placeholder="e.g. Parveen Bibi"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="service_type" class="block text-sm font-semibold text-ink mb-1">Service Type *</label>
              <select 
                id="service_type"
                [(ngModel)]="form.service_type" 
                name="service_type"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              >
                <option value="nurse">Nurse</option>
                <option value="doctor">Doctor</option>
                <option value="attendant">Attendant</option>
                <option value="other">Other Specialist</option>
              </select>
            </div>

            <div>
              <label for="area" class="block text-sm font-semibold text-ink mb-1">Locality / Area *</label>
              <input 
                id="area"
                type="text" 
                [(ngModel)]="form.area" 
                name="area"
                placeholder="e.g. Model Town & Gulberg"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label for="rate_info" class="block text-sm font-semibold text-ink mb-1">Rate Information</label>
            <input 
              id="rate_info"
              type="text" 
              [(ngModel)]="form.rate_info" 
              name="rate_info"
              placeholder="e.g. ₹1,200 per 12hr shift"
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div>
            <label for="notes" class="block text-sm font-semibold text-ink mb-1">Experience & Care Notes</label>
            <textarea 
              id="notes"
              [(ngModel)]="form.notes" 
              name="notes"
              rows="3"
              placeholder="Punctuality, special skills, availability hours..."
              class="w-full px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            ></textarea>
          </div>

          <div class="pt-3 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              [disabled]="isSaving()"
              class="flex-1 tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ isSaving() ? 'Saving...' : (editAttendant ? 'Update Attendant' : 'Add Attendant') }}
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
export class AttendantFormComponent {
  private attendantService = inject(AttendantService);

  @Input() editAttendant?: Attendant;
  @Output() close = new EventEmitter<void>();

  form: Omit<Attendant, 'id' | 'created_at'> = {
    name: '',
    service_type: 'attendant',
    area: '',
    rate_info: '',
    notes: ''
  };

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    if (this.editAttendant) {
      this.form = {
        name: this.editAttendant.name,
        service_type: this.editAttendant.service_type,
        area: this.editAttendant.area,
        rate_info: this.editAttendant.rate_info || '',
        notes: this.editAttendant.notes || ''
      };
    }
  }

  async save() {
    if (!this.form.name || !this.form.area) {
      this.errorMessage.set('Please fill in the required fields (Name and Area).');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    let res;
    if (this.editAttendant && this.editAttendant.id) {
      res = await this.attendantService.updateAttendant(this.editAttendant.id, this.form);
    } else {
      res = await this.attendantService.addAttendant(this.form);
    }

    this.isSaving.set(false);
    if (res.error) {
      this.errorMessage.set(res.error.message || 'Unable to save attendant record.');
    } else {
      this.close.emit();
    }
  }
}
