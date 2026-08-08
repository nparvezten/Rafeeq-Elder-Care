import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DiagnosticCenter, DiagnosticCategory } from '../models/diagnostic.model';

const INITIAL_DIAGNOSTICS: DiagnosticCenter[] = [
  {
    id: 'diag-1',
    name: 'District Public Diagnostic & Vitals Center',
    category: 'government',
    area: 'Gulberg / Central District',
    services: 'CBC, Basic Metabolic Panel, Urine Routine, Chest X-Ray',
    contact: '042-99201122',
    notes: 'Government facility with token system. Free for senior citizens with CNIC.',
    created_at: new Date().toISOString()
  },
  {
    id: 'diag-2',
    name: 'Al-Khidmat Subsidized Health Lab',
    category: 'subsidized',
    area: 'Model Town & Garden Town',
    services: 'Blood Glucose, HbA1c, Lipid Profile, Ultrasound',
    contact: '042-35850911',
    notes: 'Welfare trust subsidized rates (~50% discount compared to private labs). Home sample collection available.',
    created_at: new Date().toISOString()
  },
  {
    id: 'diag-3',
    name: 'Caring Hands Low-Cost Care Lab',
    category: 'low-cost-private',
    area: 'Johar Town',
    services: 'ECG, Kidney Function Tests, Liver Function Tests, Thyroid Profile',
    contact: '0300-4449911',
    notes: 'Private lab offering senior discount packages and quick WhatsApp digital reports.',
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService {
  private supabaseService = inject(SupabaseService);

  readonly centers = signal<DiagnosticCenter[]>(INITIAL_DIAGNOSTICS);
  readonly isLoading = signal<boolean>(false);

  // Filters state
  readonly selectedCategoryFilter = signal<string>('all');
  readonly searchQuery = signal<string>('');

  // Computed filtered diagnostic centers
  readonly filteredCenters = computed(() => {
    const list = this.centers();
    const cat = this.selectedCategoryFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(item => {
      const matchesCategory = cat === 'all' || item.category === cat;
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query) || 
        item.area.toLowerCase().includes(query) ||
        item.services.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  });

  constructor() {
    this.loadCenters();
  }

  async loadCenters() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('diagnostic_centers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.centers.set(data as DiagnosticCenter[]);
      }
    } catch (err) {
      console.warn('Error fetching diagnostic centers from Supabase, using local state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addCenter(center: Omit<DiagnosticCenter, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: DiagnosticCenter = {
      ...center,
      id: 'diag-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('diagnostic_centers')
          .insert([
            {
              name: center.name,
              category: center.category,
              area: center.area,
              services: center.services,
              contact: center.contact,
              notes: center.notes,
              created_by: user?.id
            }
          ])
          .select();

        if (error) {
          console.warn('Supabase diagnostic insert error, falling back to local state:', error.message);
          this.centers.update(current => [newRecord, ...current]);
          return { error: null };
        }
        if (data && data.length > 0) {
          this.centers.update(current => [data[0] as DiagnosticCenter, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase exception, falling back to local state:', err);
        this.centers.update(current => [newRecord, ...current]);
        return { error: null };
      }
    }

    this.centers.update(current => [newRecord, ...current]);
    return { error: null };
  }

  async updateCenter(id: string, center: Omit<DiagnosticCenter, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('diagnostic_centers')
          .update({
            name: center.name,
            category: center.category,
            area: center.area,
            services: center.services,
            contact: center.contact,
            notes: center.notes
          })
          .eq('id', id);

        if (error) {
          console.warn('Supabase update error, falling back to local update:', error.message);
        }
      } catch (err) {
        console.warn('Supabase update exception, falling back to local update:', err);
      }
    }

    this.centers.update(current => 
      current.map(item => item.id === id ? { ...item, ...center } : item)
    );
    return { error: null };
  }
}
