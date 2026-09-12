import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { RehabSessionLog, RehabSpecialist } from '../models/rehab.model';

const INITIAL_SPECIALISTS: RehabSpecialist[] = [
  {
    id: 'spec-1',
    name: 'Dr. Anand Verma, PT',
    specialty: 'Physiotherapist',
    phone: '+91 98765 22334',
    schedule_frequency: 'Daily (Mon to Sat) @ 11:30 AM',
    fee_per_visit: 800,
    clinic_or_agency: 'Neuro-Rehab Home Care',
    notes: 'Focuses on passive limb movement, bed mobility, joint contracture prevention, and sitting balance.'
  },
  {
    id: 'spec-2',
    name: 'Pooja Sharma, SLP',
    specialty: 'Speech & Swallow Therapist',
    phone: '+91 98190 77889',
    schedule_frequency: 'Alternate Days (Mon, Wed, Fri) @ 04:00 PM',
    fee_per_visit: 1000,
    clinic_or_agency: 'Speech & Cognitive Care Center',
    notes: 'Assessing swallowing safety (dysphagia management) and facial muscle stimulation.'
  },
  {
    id: 'spec-3',
    name: 'Sister Mary Joseph, RN',
    specialty: 'Visiting Nurse',
    phone: '+91 98200 99881',
    schedule_frequency: 'Twice Weekly (Tue, Fri) @ 09:00 AM',
    fee_per_visit: 600,
    clinic_or_agency: 'St. Jude Home Care Services',
    notes: 'Assists with Ryle tube / catheter maintenance, skin inspection, and hygiene protocol.'
  }
];

const INITIAL_SESSIONS: RehabSessionLog[] = [
  {
    id: 'sess-1',
    specialist_id: 'spec-1',
    specialist_name: 'Dr. Anand Verma, PT',
    session_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration_minutes: 45,
    exercises_summary: 'Passive range of motion for left arm and leg. 10 minutes of assisted bed-edge sitting.',
    fee_paid: 800,
    caregiver_notes: 'Patient tolerated sitting position well for 8 minutes without dizziness.',
    created_at: new Date().toISOString()
  },
  {
    id: 'sess-2',
    specialist_id: 'spec-2',
    specialist_name: 'Pooja Sharma, SLP',
    session_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration_minutes: 40,
    exercises_summary: 'Oral motor stimulation, tongue exercises, and swallowing reflex practice with thickened fluid.',
    fee_paid: 1000,
    caregiver_notes: 'Advised to keep chin slightly tucked during spoon feeding.',
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class RehabService {
  private supabaseService = inject(SupabaseService);

  readonly specialists = signal<RehabSpecialist[]>(INITIAL_SPECIALISTS);
  readonly sessions = signal<RehabSessionLog[]>(INITIAL_SESSIONS);
  readonly isLoading = signal<boolean>(false);

  readonly totalSessionsCount = computed(() => this.sessions().length);
  readonly totalRehabSpend = computed(() =>
    this.sessions().reduce((sum, s) => sum + (s.fee_paid || 0), 0)
  );

  constructor() {
    this.loadData();
  }

  async loadData() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const [specsRes, sessRes] = await Promise.all([
        supabase.from('rehab_specialists').select('*').order('name', { ascending: true }),
        supabase.from('rehab_sessions').select('*').order('session_date', { ascending: false })
      ]);

      if (!specsRes.error && specsRes.data && specsRes.data.length > 0) {
        this.specialists.set(specsRes.data as RehabSpecialist[]);
      }
      if (!sessRes.error && sessRes.data && sessRes.data.length > 0) {
        this.sessions.set(sessRes.data as RehabSessionLog[]);
      }
    } catch (err) {
      console.warn('Error loading rehab data from Supabase, using fallback state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addSpecialist(spec: Omit<RehabSpecialist, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: RehabSpecialist = {
      ...spec,
      id: 'spec-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('rehab_specialists')
          .insert([{
            ...spec,
            created_by: user?.id
          }])
          .select();

        if (!error && data && data.length > 0) {
          this.specialists.update(curr => [...curr, data[0] as RehabSpecialist]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase specialist insert error:', err);
      }
    }

    this.specialists.update(curr => [...curr, newRecord]);
    return { error: null };
  }

  async logSession(session: Omit<RehabSessionLog, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: RehabSessionLog = {
      ...session,
      id: 'sess-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('rehab_sessions')
          .insert([{
            ...session,
            created_by: user?.id
          }])
          .select();

        if (!error && data && data.length > 0) {
          this.sessions.update(curr => [data[0] as RehabSessionLog, ...curr]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase session log insert error:', err);
      }
    }

    this.sessions.update(curr => [newRecord, ...curr]);
    return { error: null };
  }
}
