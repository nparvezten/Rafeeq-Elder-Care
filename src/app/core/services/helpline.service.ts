import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Helpline, HelplineScope } from '../models/helpline.model';

const INITIAL_HELPLINES: Helpline[] = [
  {
    id: 'help-1',
    name: 'Elder Line - Senior Citizen National Helpline (India)',
    scope: 'national',
    phone: '14567',
    email: 'elderline@socialjustice.gov.in',
    area: 'All India',
    notes: 'Toll-free national helpline for senior citizens in India. Operational 8:00 AM – 8:00 PM for information, guidance, emotional support, and elder abuse intervention.',
    created_at: new Date().toISOString()
  },
  {
    id: 'help-2',
    name: 'Befrienders Worldwide International Crisis Line',
    scope: 'international',
    phone: 'VERIFY BEFORE USE',
    email: 'support@befrienders.org',
    notes: 'Global network of emotional support centers offering confidential support for emotional distress and caregiver crisis.',
    created_at: new Date().toISOString()
  },
  {
    id: 'help-3',
    name: 'Local Emergency Medical & Ambulance Services',
    scope: 'local',
    phone: '112 / 102',
    area: 'Local Metro Area',
    notes: 'Emergency ambulance dispatch and medical helpline service.',
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class HelplineService {
  private supabaseService = inject(SupabaseService);

  readonly helplines = signal<Helpline[]>(INITIAL_HELPLINES);
  readonly isLoading = signal<boolean>(false);

  // Filters state
  readonly selectedScopeFilter = signal<string>('all');
  readonly searchQuery = signal<string>('');

  // Computed filtered helplines
  readonly filteredHelplines = computed(() => {
    const list = this.helplines();
    const scope = this.selectedScopeFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(item => {
      const matchesScope = scope === 'all' || item.scope === scope;
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query) || 
        item.phone.toLowerCase().includes(query) ||
        (item.area && item.area.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      return matchesScope && matchesQuery;
    });
  });

  constructor() {
    this.loadHelplines();
  }

  async loadHelplines() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('helplines')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.helplines.set(data as Helpline[]);
      }
    } catch (err) {
      console.warn('Error fetching helplines from Supabase, using local state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addHelpline(helpline: Omit<Helpline, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: Helpline = {
      ...helpline,
      id: 'help-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('helplines')
          .insert([
            {
              name: helpline.name,
              scope: helpline.scope,
              phone: helpline.phone,
              email: helpline.email,
              area: helpline.area,
              notes: helpline.notes,
              created_by: user?.id
            }
          ])
          .select();

        if (error) {
          console.warn('Supabase helpline insert error, falling back to local state:', error.message);
          this.helplines.update(current => [newRecord, ...current]);
          return { error: null };
        }
        if (data && data.length > 0) {
          this.helplines.update(current => [data[0] as Helpline, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase exception, falling back to local state:', err);
        this.helplines.update(current => [newRecord, ...current]);
        return { error: null };
      }
    }

    this.helplines.update(current => [newRecord, ...current]);
    return { error: null };
  }

  async updateHelpline(id: string, helpline: Omit<Helpline, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('helplines')
          .update({
            name: helpline.name,
            scope: helpline.scope,
            phone: helpline.phone,
            email: helpline.email,
            area: helpline.area,
            notes: helpline.notes
          })
          .eq('id', id);

        if (error) {
          console.warn('Supabase update error, falling back to local update:', error.message);
        }
      } catch (err) {
        console.warn('Supabase update exception, falling back to local update:', err);
      }
    }

    this.helplines.update(current => 
      current.map(item => item.id === id ? { ...item, ...helpline } : item)
    );
    return { error: null };
  }
}
