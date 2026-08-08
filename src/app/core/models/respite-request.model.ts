export type RespiteStatus = 'open' | 'claimed';

export interface RespiteRequest {
  id?: string;
  requested_by: string;
  date: string;
  time_range: string;
  note?: string;
  status: RespiteStatus;
  claimed_by?: string | null;
  created_at?: string;
  created_by?: string;
}
