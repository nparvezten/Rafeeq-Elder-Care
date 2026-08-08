export type DiagnosticCategory = 'government' | 'subsidized' | 'low-cost-private';

export interface DiagnosticCenter {
  id?: string;
  name: string;
  category: DiagnosticCategory;
  area: string;
  services: string;
  contact?: string;
  notes?: string;
  created_at?: string;
  created_by?: string;
}
