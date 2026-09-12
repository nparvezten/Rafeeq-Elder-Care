import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'wisdom',
    pathMatch: 'full'
  },
  {
    path: 'wisdom',
    loadComponent: () => 
      import('./features/wisdom/wisdom-carousel.component').then(m => m.WisdomCarouselComponent)
  },
  {
    path: 'routine',
    loadComponent: () => 
      import('./features/routine/routine-view.component').then(m => m.RoutineViewComponent)
  },
  {
    path: 'supplies',
    loadComponent: () => 
      import('./features/supplies/supplies-view.component').then(m => m.SuppliesViewComponent)
  },
  {
    path: 'rehab',
    loadComponent: () => 
      import('./features/rehab/rehab-view.component').then(m => m.RehabViewComponent)
  },
  {
    path: 'attendants',
    loadComponent: () => 
      import('./features/attendants/attendant-list.component').then(m => m.AttendantListComponent)
  },
  {
    path: 'expenses',
    loadComponent: () => 
      import('./features/expenses/expense-list.component').then(m => m.ExpenseListComponent)
  },
  {
    path: 'respite',
    loadComponent: () => 
      import('./features/respite/respite-list.component').then(m => m.RespiteListComponent)
  },
  {
    path: 'diagnostics',
    loadComponent: () => 
      import('./features/diagnostics/diagnostic-list.component').then(m => m.DiagnosticListComponent)
  },
  {
    path: 'helplines',
    loadComponent: () => 
      import('./features/helplines/helpline-list.component').then(m => m.HelplineListComponent)
  },
  {
    path: 'gratitude',
    loadComponent: () => 
      import('./features/gratitude/gratitude-view.component').then(m => m.GratitudeViewComponent)
  },
  {
    path: 'settings',
    loadComponent: () => 
      import('./features/settings/notification-settings.component').then(m => m.NotificationSettingsComponent)
  },
  {
    path: '**',
    redirectTo: 'wisdom'
  }
];


