import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GratitudeEntry } from '../models/gratitude.model';

export const GRATITUDE_PROMPTS: string[] = [
  "What made your parent smile today?",
  "What are you grateful for today, despite the hardship?",
  "What's one small thing that went right today?",
  "What gentle moment with your family brought you peace today?",
  "Who supported or helped you through a care task today?",
  "What is one quiet strength you discovered in yourself today?"
];

const INITIAL_ENTRIES: GratitudeEntry[] = [
  {
    id: 'grat-1',
    prompt_text: "What made your parent smile today?",
    response: "Looking at old family photo albums after tea in the afternoon.",
    entry_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class GratitudeService {
  private supabaseService = inject(SupabaseService);

  readonly entries = signal<GratitudeEntry[]>(INITIAL_ENTRIES);
  readonly isLoading = signal<boolean>(false);

  // Computes current daily prompt by cycling based on day of year
  readonly todayPrompt = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const promptIndex = dayOfYear % GRATITUDE_PROMPTS.length;
    return GRATITUDE_PROMPTS[promptIndex];
  });

  constructor() {
    this.loadEntries();
  }

  async loadEntries() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (!error && data && data.length > 0) {
        this.entries.set(data as GratitudeEntry[]);
      }
    } catch (err) {
      console.warn('Error fetching gratitude entries from Supabase, using local state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addEntry(response: string, customPrompt?: string): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();
    const promptText = customPrompt || this.todayPrompt();
    const todayStr = new Date().toISOString().split('T')[0];

    const newRecord: GratitudeEntry = {
      id: 'grat-' + Date.now(),
      prompt_text: promptText,
      response: response.trim(),
      entry_date: todayStr,
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('gratitude_entries')
          .insert([
            {
              prompt_text: promptText,
              response: response.trim(),
              entry_date: todayStr,
              created_by: user?.id
            }
          ])
          .select();

        if (error) {
          console.warn('Supabase gratitude insert error, falling back to local state:', error.message);
          this.entries.update(current => [newRecord, ...current]);
          return { error: null };
        }
        if (data && data.length > 0) {
          this.entries.update(current => [data[0] as GratitudeEntry, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase exception, falling back to local state:', err);
        this.entries.update(current => [newRecord, ...current]);
        return { error: null };
      }
    }

    this.entries.update(current => [newRecord, ...current]);
    return { error: null };
  }
}
