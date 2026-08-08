export interface GratitudeEntry {
  id?: string;
  prompt_text: string;
  response: string;
  entry_date: string;
  created_at?: string;
  created_by?: string;
}

export interface WisdomQuote {
  id: string;
  category: string;
  text: string;
  source: string;
}

export interface WisdomQuotesData {
  note: string;
  categories: string[];
  quotes: WisdomQuote[];
}
