export type HelplineScope = 'international' | 'national' | 'local';

export interface Helpline {
  id?: string;
  name: string;
  scope: HelplineScope;
  phone: string;
  email?: string;
  area?: string;
  notes?: string;
  created_at?: string;
  created_by?: string;
}
