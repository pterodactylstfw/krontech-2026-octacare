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
    path: '',
    loadComponent: () =>
      import('./shared/shell-layout/shell-layout').then((m) => m.ShellLayoutComponent),
    children: [
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar-view/calendar-view').then((m) => m.CalendarViewComponent)
      },
      {
        path: 'operating-rooms',
        loadComponent: () =>
          import('./features/operating-rooms/operating-rooms-list/operating-rooms-list').then(
            (m) => m.OperatingRoomsListComponent
          )
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/staff/staff-list/staff-list').then((m) => m.StaffList)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
