export type ServiceType = 'nurse' | 'doctor' | 'attendant' | 'other';

export interface Attendant {
  id?: string;
  name: string;
  service_type: ServiceType;
  area: string;
  contact_number?: string;
  rate_info?: string;
  notes?: string;
  created_at?: string;
  created_by?: string;
}
