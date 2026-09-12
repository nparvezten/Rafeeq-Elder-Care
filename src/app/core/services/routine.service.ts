import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CareRoutineLog, PatientPosition, RoutineTask } from '../models/routine.model';

const DEFAULT_DAILY_TASKS: RoutineTask[] = [
  {
    id: 'task-1',
    title: 'Morning Sponge Bath & Hygiene',
    category: 'hygiene',
    description: 'Warm water sponge bath, oral care, and clean fresh clothes.',
    suggestedTime: '08:00 AM',
    completed: true,
    completedAt: '08:30 AM',
    completedBy: 'Mary (Attendant)'
  },
  {
    id: 'task-2',
    title: 'Back Massage & Skin Hydration',
    category: 'skin',
    description: 'Apply moisturiser on back, sacrum, heels, and elbows to protect skin integrity.',
    suggestedTime: '09:00 AM',
    completed: true,
    completedAt: '09:15 AM',
    completedBy: 'Tariq'
  },
  {
    id: 'task-3',
    title: 'Air Mattress Pressure Check',
    category: 'bedding',
    description: 'Verify alternate pressure ripple cycle is inflating properly and no kinks in air hose.',
    suggestedTime: '10:00 AM',
    completed: false
  },
  {
    id: 'task-4',
    title: 'Afternoon Diaper & Linen Refresh',
    category: 'hygiene',
    description: 'Check underpads, change adult diaper, and ensure dry skin.',
    suggestedTime: '02:00 PM',
    completed: false
  },
  {
    id: 'task-5',
    title: 'Hydration & Nutrition Assistance',
    category: 'hydration',
    description: 'Ensure slow upright feeding / fluid intake according to caregiver routine.',
    suggestedTime: '04:30 PM',
    completed: false
  },
  {
    id: 'task-6',
    title: 'Night Bedding & Positioning Prep',
    category: 'position',
    description: 'Comfortable pillow alignment under knees, heels suspended, and bed side-rails secured.',
    suggestedTime: '08:30 PM',
    completed: false
  }
];

const INITIAL_LOGS: CareRoutineLog[] = [
  {
    id: 'log-1',
    activity_type: 'position_turn',
    title: 'Patient repositioned to Right Lateral',
    details: 'Pillows placed behind back and between knees for support.',
    position: 'Right Lateral',
    performed_by: 'Sister Mary',
    logged_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'log-2',
    activity_type: 'sponge_bath',
    title: 'Morning Sponge Bath Completed',
    details: 'Patient comfortable, skin clean, fresh bed linen replaced.',
    performed_by: 'Mary (Attendant)',
    logged_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'log-3',
    activity_type: 'position_turn',
    title: 'Patient repositioned to Back (Supine)',
    details: 'Head elevated at 30 degrees.',
    position: 'Back (Supine)',
    performed_by: 'Tariq',
    logged_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private supabaseService = inject(SupabaseService);

  readonly tasks = signal<RoutineTask[]>(DEFAULT_DAILY_TASKS);
  readonly logs = signal<CareRoutineLog[]>(INITIAL_LOGS);
  readonly currentPosition = signal<PatientPosition>('Right Lateral');
  readonly lastTurnedAt = signal<string>(new Date(Date.now() - 45 * 60 * 1000).toISOString());
  readonly isLoading = signal<boolean>(false);

  readonly completedTasksCount = computed(() => {
    return this.tasks().filter(t => t.completed).length;
  });

  readonly totalTasksCount = computed(() => {
    return this.tasks().length;
  });

  constructor() {
    this.loadLogs();
  }

  async loadLogs() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('care_routine_logs')
        .select('*')
        .order('logged_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.logs.set(data as CareRoutineLog[]);
        const latestTurn = data.find((d: any) => d.position);
        if (latestTurn) {
          this.currentPosition.set(latestTurn.position);
          this.lastTurnedAt.set(latestTurn.logged_at);
        }
      }
    } catch (err) {
      console.warn('Error loading routine logs from Supabase, using fallback state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async turnPatient(newPosition: PatientPosition, performedBy: string, details?: string): Promise<void> {
    const nowIso = new Date().toISOString();
    this.currentPosition.set(newPosition);
    this.lastTurnedAt.set(nowIso);

    const logEntry: Omit<CareRoutineLog, 'id'> = {
      activity_type: 'position_turn',
      title: `Patient repositioned to ${newPosition}`,
      position: newPosition,
      performed_by: performedBy || 'Family Member',
      details: details || `Turned to ${newPosition} for pressure relief.`,
      logged_at: nowIso
    };

    await this.addLogEntry(logEntry);
  }

  toggleTask(taskId: string, completedBy?: string) {
    this.tasks.update(current => 
      current.map(task => {
        if (task.id === taskId) {
          const isNowCompleted = !task.completed;
          const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...task,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? timeNow : undefined,
            completedBy: isNowCompleted ? (completedBy || 'Caregiver') : undefined
          };
        }
        return task;
      })
    );
  }

  async addLogEntry(entry: Omit<CareRoutineLog, 'id'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: CareRoutineLog = {
      ...entry,
      id: 'log-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('care_routine_logs')
          .insert([{
            activity_type: entry.activity_type,
            title: entry.title,
            details: entry.details,
            position: entry.position,
            performed_by: entry.performed_by,
            logged_at: entry.logged_at,
            created_by: user?.id
          }])
          .select();

        if (!error && data && data.length > 0) {
          this.logs.update(current => [data[0] as CareRoutineLog, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase log insert exception, falling back to local state:', err);
      }
    }

    this.logs.update(current => [newRecord, ...current]);
    return { error: null };
  }
}
