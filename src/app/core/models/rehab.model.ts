export type SpecialistType = 'Physiotherapist' | 'Occupational Therapist' | 'Speech & Swallow Therapist' | 'Visiting Nurse' | 'Other';

export interface RehabSpecialist {
  id: string;
  name: string;
  specialty: SpecialistType;
  phone: string;
  schedule_frequency: string;
  fee_per_visit: number;
  clinic_or_agency?: string;
  notes?: string;
  created_at?: string;
  created_by?: string;
}

export interface RehabSessionLog {
  id: string;
  specialist_id?: string;
  specialist_name: string;
  session_date: string;
  duration_minutes: number;
  exercises_summary: string;
  fee_paid: number;
  caregiver_notes?: string;
  created_at?: string;
  created_by?: string;
}
