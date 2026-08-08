import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-canvas text-ink font-sans flex flex-col selection:bg-warmth/20">
      <app-header></app-header>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="border-t border-ink/10 py-6 text-center text-sm text-ink/60 bg-canvas mt-12">
        <div class="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Rafeeq Care MVP — Family Eldercare Companion</span>
          <span class="text-xs">Self-hostable static app built with Angular & Supabase</span>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  title = 'Rafeeq Care MVP';
}
