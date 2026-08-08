import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'attendants',
    pathMatch: 'full'
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
    path: '**',
    redirectTo: 'attendants'
  }
];
