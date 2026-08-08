import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Helpline, HelplineScope } from '../../core/models/helpline.model';
import { HelplineService } from '../../core/services/helpline.service';

@Component({
  selector: 'app-helpline-form',
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
          {{ editHelpline ? 'Edit Helpline' : 'Add Emergency / Care Helpline' }}
        </h2>
        <p class="text-ink/80 text-sm mb-6">
          Record essential helpline contacts for crisis intervention, eldercare assistance, or local emergency services.
        </p>

        @if (errorMessage()) {
          <div class="p-3 bg-tender/20 border border-tender/40 text-ink rounded-xl mb-4 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="save()" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-semibold text-ink mb-1">Helpline / Organization Name *</label>
            <input 
              id="name"
              type="text" 
              [(ngModel)]="form.name" 
              name="name"
              placeholder="e.g. Senior Citizen National Helpline"
              required
              class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="scope" class="block text-sm font-semibold text-ink mb-1">Scope *</label>
              <select 
                id="scope"
                [(ngModel)]="form.scope" 
                name="scope"
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              >
                <option value="national">National</option>
                <option value="international">International</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div>
              <label for="phone" class="block text-sm font-semibold text-ink mb-1">Phone Number *</label>
              <input 
                id="phone"
                type="text" 
                [(ngModel)]="form.phone" 
                name="phone"
                placeholder="e.g. 14567 or +1 800..."
                required
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="email" class="block text-sm font-semibold text-ink mb-1">Email (Optional)</label>
              <input 
                id="email"
                type="email" 
                [(ngModel)]="form.email" 
                name="email"
                placeholder="support@helpline.org"
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>

            <div>
              <label for="area" class="block text-sm font-semibold text-ink mb-1">Area / Jurisdiction</label>
              <input 
                id="area"
                type="text" 
                [(ngModel)]="form.area" 
                name="area"
                placeholder="e.g. All India / Local Metro"
                class="w-full tap-target px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label for="notes" class="block text-sm font-semibold text-ink mb-1">Operating Hours & Services</label>
            <textarea 
              id="notes"
              [(ngModel)]="form.notes" 
              name="notes"
              rows="3"
              placeholder="Toll-free 8am-8pm, elder rights guidance, emotional crisis support..."
              class="w-full px-4 py-3 bg-white border border-ink/20 rounded-xl text-ink focus:ring-2 focus:ring-companion/40 outline-none"
            ></textarea>
          </div>

          <div class="pt-3 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              [disabled]="isSaving()"
              class="flex-1 tap-target px-6 py-3 bg-companion text-canvas rounded-xl font-medium hover:bg-companion/95 disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ isSaving() ? 'Saving...' : (editHelpline ? 'Update Helpline' : 'Add Helpline') }}
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
export class HelplineFormComponent {
  private helplineService = inject(HelplineService);

  @Input() editHelpline?: Helpline;
  @Output() close = new EventEmitter<void>();

  form: Omit<Helpline, 'id' | 'created_at'> = {
    name: '',
    scope: 'national',
    phone: '',
    email: '',
    area: '',
    notes: ''
  };

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    if (this.editHelpline) {
      this.form = {
        name: this.editHelpline.name,
        scope: this.editHelpline.scope,
        phone: this.editHelpline.phone,
        email: this.editHelpline.email || '',
        area: this.editHelpline.area || '',
        notes: this.editHelpline.notes || ''
      };
    }
  }

  async save() {
    if (!this.form.name || !this.form.phone) {
      this.errorMessage.set('Please fill in Name and Phone Number.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    let res;
    if (this.editHelpline && this.editHelpline.id) {
      res = await this.helplineService.updateHelpline(this.editHelpline.id, this.form);
    } else {
      res = await this.helplineService.addHelpline(this.form);
    }

    this.isSaving.set(false);
    if (res.error) {
      this.errorMessage.set(res.error.message || 'Unable to save helpline entry.');
    } else {
      this.close.emit();
    }
  }
}
