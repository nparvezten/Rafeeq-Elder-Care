import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Attendant, ServiceType } from '../models/attendant.model';

const INITIAL_ATTENDANTS: Attendant[] = [
  {
    id: 'att-1',
    name: 'Rashid Khan',
    service_type: 'attendant',
    area: 'Gulberg & Model Town',
    rate_info: '₹800 / 12hr shift',
    notes: 'Punctual, experienced with mobility assistance, wheelchair transfers, and gentle night watch.',
    created_at: new Date().toISOString()
  },
  {
    id: 'att-2',
    name: 'Dr. Sarah Ahmed',
    service_type: 'doctor',
    area: 'Defence / Johar Town',
    rate_info: '₹2,500 / home visit',
    notes: 'Geriatric general physician. Available for routine weekly checkups and vitals review.',
    created_at: new Date().toISOString()
  },
  {
    id: 'att-3',
    name: 'Parveen Bibi',
    service_type: 'nurse',
    area: 'Faisal Town & Garden Town',
    rate_info: '₹1,200 / day shift',
    notes: 'Certified diploma nurse. Skilled in IV administration, wound care, and blood pressure logging.',
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class AttendantService {
  private supabaseService = inject(SupabaseService);

  readonly attendants = signal<Attendant[]>(INITIAL_ATTENDANTS);
  readonly isLoading = signal<boolean>(false);

  // Filters state
  readonly selectedTypeFilter = signal<string>('all');
  readonly searchQuery = signal<string>('');

  // Computed filtered attendants
  readonly filteredAttendants = computed(() => {
    const list = this.attendants();
    const type = this.selectedTypeFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(item => {
      const matchesType = type === 'all' || item.service_type === type;
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query) || 
        item.area.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      return matchesType && matchesQuery;
    });
  });

  constructor() {
    this.loadAttendants();
  }

  async loadAttendants() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('attendants')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.attendants.set(data as Attendant[]);
      }
    } catch (err) {
      console.warn('Error fetching attendants from Supabase, using local state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addAttendant(attendant: Omit<Attendant, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: Attendant = {
      ...attendant,
      id: 'att-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('attendants')
          .insert([
            {
              name: attendant.name,
              service_type: attendant.service_type,
              area: attendant.area,
              rate_info: attendant.rate_info,
              notes: attendant.notes,
              created_by: user?.id
            }
          ])
          .select();

        if (error) {
          console.warn('Supabase table error, falling back to local state:', error.message);
          this.attendants.update(current => [newRecord, ...current]);
          return { error: null };
        }
        if (data && data.length > 0) {
          this.attendants.update(current => [data[0] as Attendant, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase exception, falling back to local state:', err);
        this.attendants.update(current => [newRecord, ...current]);
        return { error: null };
      }
    }

    this.attendants.update(current => [newRecord, ...current]);
    return { error: null };
  }

  async updateAttendant(id: string, attendant: Omit<Attendant, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('attendants')
          .update({
            name: attendant.name,
            service_type: attendant.service_type,
            area: attendant.area,
            rate_info: attendant.rate_info,
            notes: attendant.notes
          })
          .eq('id', id);

        if (error) {
          console.warn('Supabase update error, falling back to local update:', error.message);
        }
      } catch (err) {
        console.warn('Supabase update exception, falling back to local update:', err);
      }
    }

    this.attendants.update(current => 
      current.map(item => item.id === id ? { ...item, ...attendant } : item)
    );
    return { error: null };
  }
}
