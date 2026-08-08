import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { RespiteRequest } from '../models/respite-request.model';

const INITIAL_RESPITE_REQUESTS: RespiteRequest[] = [
  {
    id: 'resp-1',
    requested_by: 'Fatima',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time_range: 'Tuesday 2:00 PM – 6:00 PM',
    note: 'Need coverage for parent during afternoon doctor consultation.',
    status: 'open',
    claimed_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'resp-2',
    requested_by: 'Tariq',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time_range: 'Thursday 10:00 AM – 2:00 PM',
    note: 'Weekly pharmacy run and rest interval.',
    status: 'claimed',
    claimed_by: 'Zainab',
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class RespiteService {
  private supabaseService = inject(SupabaseService);

  readonly requests = signal<RespiteRequest[]>(INITIAL_RESPITE_REQUESTS);
  readonly isLoading = signal<boolean>(false);

  // Computed signals: Open requests first, claimed requests below
  readonly openRequests = computed(() => {
    return this.requests().filter(r => r.status === 'open');
  });

  readonly claimedRequests = computed(() => {
    return this.requests().filter(r => r.status === 'claimed');
  });

  constructor() {
    this.loadRequests();
  }

  async loadRequests() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('respite_requests')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        this.requests.set(data as RespiteRequest[]);
      }
    } catch (err) {
      console.warn('Error loading respite requests from Supabase, using local state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addRequest(request: Omit<RespiteRequest, 'id' | 'status' | 'claimed_by' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: RespiteRequest = {
      ...request,
      id: 'resp-' + Date.now(),
      status: 'open',
      claimed_by: null,
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('respite_requests')
          .insert([
            {
              requested_by: request.requested_by,
              date: request.date,
              time_range: request.time_range,
              note: request.note,
              status: 'open',
              created_by: user?.id
            }
          ])
          .select();

        if (error) {
          console.warn('Supabase respite insert error, falling back to local:', error.message);
          this.requests.update(current => [newRecord, ...current]);
          return { error: null };
        }
        if (data && data.length > 0) {
          this.requests.update(current => [data[0] as RespiteRequest, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase exception, falling back to local state:', err);
        this.requests.update(current => [newRecord, ...current]);
        return { error: null };
      }
    }

    this.requests.update(current => [newRecord, ...current]);
    return { error: null };
  }

  async claimRequest(id: string, claimedBy: string): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('respite_requests')
          .update({
            status: 'claimed',
            claimed_by: claimedBy
          })
          .eq('id', id);

        if (error) {
          console.warn('Supabase claim update error, falling back to local update:', error.message);
        }
      } catch (err) {
        console.warn('Supabase claim exception, falling back to local update:', err);
      }
    }

    this.requests.update(current => 
      current.map(r => r.id === id ? { ...r, status: 'claimed', claimed_by: claimedBy } : r)
    );
    return { error: null };
  }
}
