import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WisdomService } from '../../core/services/wisdom.service';
import { WisdomQuote } from '../../core/models/gratitude.model';

@Component({
  selector: 'app-wisdom-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6 overflow-hidden">
      
      <!-- Section Header & Description -->
      <div class="text-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink font-serif-header mb-1">
          Shared Wisdom & Reflection
        </h1>
        <p class="text-ink/80 text-base max-w-lg mx-auto leading-relaxed">
          Timeless thoughts on care, filial duty, and quiet compassion across human traditions.
        </p>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex items-center justify-center flex-wrap gap-2 mb-6">
        @for (cat of categories(); track cat) {
          <button 
            (click)="selectCategory(cat)"
            [ngClass]="{
              'bg-companion text-canvas font-bold shadow-sm': selectedCategory() === cat,
              'bg-canvas border border-ink/20 text-ink/80 hover:text-ink hover:bg-ink/5': selectedCategory() !== cat
            }"
            class="tap-target px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all"
          >
            {{ cat === 'all' ? 'All Traditions' : cat }}
          </button>
        }
      </div>

      <!-- Carousel Container Card with Soft Companion/Warmth Gradient -->
      <div 
        (mouseenter)="pauseAutoplay()"
        (mouseleave)="resumeAutoplay()"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)"
        class="journal-card relative overflow-hidden bg-gradient-to-br from-companion/95 via-companion/85 to-warmth/90 text-canvas p-6 sm:p-10 min-h-[280px] flex flex-col justify-between shadow-lg w-full max-w-full"
      >
        <!-- Background subtle decorative circle -->
        <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-warmth/20 rounded-full blur-2xl pointer-events-none"></div>

        @if (quotes().length > 0) {
          <!-- Quote Body -->
          <div class="relative z-10 flex-1 flex flex-col justify-center my-auto">
            <span class="text-3xl sm:text-4xl font-serif text-warmth/80 leading-none select-none">“</span>
            
            <p class="font-serif text-lg sm:text-2xl sm:leading-relaxed font-semibold tracking-tight my-2 sm:my-3 text-canvas/95 leading-snug">
              {{ currentQuote().text }}
            </p>

            <p class="text-xs sm:text-base font-medium text-canvas/75 font-sans mt-2 tracking-wide uppercase">
              — {{ currentQuote().source }}
            </p>
          </div>

          <!-- Controls & Indicator Footer -->
          <div class="relative z-10 pt-4 sm:pt-6 flex items-center justify-between gap-2 sm:gap-4 border-t border-canvas/15 mt-4 sm:mt-6 w-full">
            
            <!-- Navigation Arrow Left -->
            <button 
              (click)="prevQuote()" 
              class="tap-target p-2 text-canvas/80 hover:text-canvas rounded-full transition-colors flex-shrink-0 bg-canvas/10 hover:bg-canvas/20"
              aria-label="Previous quote"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <!-- Counter / Dots Indicator -->
            <div class="flex items-center justify-center flex-1 px-2">
              <span class="text-xs sm:text-sm font-semibold tracking-wider text-canvas/90 bg-canvas/10 px-3 py-1 rounded-full font-mono">
                {{ currentIndex() + 1 }} / {{ quotes().length }}
              </span>
            </div>

            <!-- Navigation Arrow Right -->
            <button 
              (click)="nextQuote()" 
              class="tap-target p-2 text-canvas/80 hover:text-canvas rounded-full transition-colors flex-shrink-0 bg-canvas/10 hover:bg-canvas/20"
              aria-label="Next quote"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

          </div>
        } @else {
          <div class="text-center my-auto py-8">
            <p class="text-canvas/80 text-base">No quotes found for this tradition.</p>
          </div>
        }

      </div>
    </div>
  `
})
export class WisdomCarouselComponent implements OnInit, OnDestroy {
  private wisdomService = inject(WisdomService);

  readonly categories = this.wisdomService.categories;
  readonly selectedCategory = this.wisdomService.selectedCategory;
  readonly quotes = this.wisdomService.filteredQuotes;

  readonly currentIndex = signal<number>(0);
  private timer: any;
  private isPaused = false;
  private touchStartX = 0;

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  currentQuote(): WisdomQuote {
    const list = this.quotes();
    if (list.length === 0) return { id: '', category: '', text: '', source: '' };
    const index = this.currentIndex() % list.length;
    return list[index];
  }

  selectCategory(cat: string) {
    this.wisdomService.selectedCategory.set(cat);
    this.currentIndex.set(0);
  }

  nextQuote() {
    const list = this.quotes();
    if (list.length > 0) {
      this.currentIndex.update(idx => (idx + 1) % list.length);
    }
  }

  prevQuote() {
    const list = this.quotes();
    if (list.length > 0) {
      this.currentIndex.update(idx => (idx - 1 + list.length) % list.length);
    }
  }

  goToIndex(idx: number) {
    this.currentIndex.set(idx);
  }

  private startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => {
      if (!this.isPaused) {
        this.nextQuote();
      }
    }, 7000);
  }

  private stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  pauseAutoplay() {
    this.isPaused = true;
  }

  resumeAutoplay() {
    this.isPaused = false;
  }

  onTouchStart(event: TouchEvent) {
    this.pauseAutoplay();
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    this.resumeAutoplay();
    const touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;

    if (diff > 50) {
      this.nextQuote();
    } else if (diff < -50) {
      this.prevQuote();
    }
  }
}
