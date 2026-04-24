import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'staff',
    loadComponent: () =>
      import('./features/staff/staff-list/staff-list').then((m) => m.StaffList)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];