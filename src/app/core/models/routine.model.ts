export type PatientPosition = 'Back (Supine)' | 'Left Lateral' | 'Right Lateral' | 'Semi-Fowler (Upright)';

export interface RoutineTask {
  id: string;
  title: string;
  category: 'hygiene' | 'position' | 'bedding' | 'hydration' | 'skin';
  description: string;
  suggestedTime?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface CareRoutineLog {
  id: string;
  activity_type: 'position_turn' | 'sponge_bath' | 'diaper_change' | 'hydration' | 'massage_skin' | 'linen_change' | 'general_care';
  title: string;
  details?: string;
  position?: PatientPosition;
  performed_by: string;
  logged_at: string;
  created_at?: string;
  created_by?: string;
}
