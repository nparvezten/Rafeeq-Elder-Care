import { Injectable, signal, computed } from '@angular/core';
import { WisdomQuote, WisdomQuotesData } from '../models/gratitude.model';
import quotesJson from '../../../assets/wisdom-quotes.json';

@Injectable({
  providedIn: 'root'
})
export class WisdomService {
  private rawData: WisdomQuotesData = quotesJson as WisdomQuotesData;

  readonly allQuotes = signal<WisdomQuote[]>(this.rawData.quotes);
  readonly selectedCategory = signal<string>('all');

  readonly categories = signal<string[]>(['all', ...this.rawData.categories]);

  readonly filteredQuotes = computed(() => {
    const category = this.selectedCategory().toLowerCase();
    const quotes = this.allQuotes();

    if (category === 'all') {
      return quotes;
    }
    return quotes.filter(q => q.category.toLowerCase() === category);
  });
}
