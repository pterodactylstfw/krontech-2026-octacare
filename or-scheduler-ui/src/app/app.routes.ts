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
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
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
        path: 'surgeons',
        loadComponent: () =>
          import('./features/surgeons/surgeons.component').then((m) => m.SurgeonsComponent)
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/staff/staff-list/staff-list').then((m) => m.StaffList)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent)
      },
    ]
  },
  {
    path: 'patients',
    children: [
      {
        path: '',
        redirectTo: 'portal',
        pathMatch: 'full'
      },
      {
        path: 'portal',
        loadComponent: () =>
          import('./features/patients/patient-portal/patient-portal.component').then((m) => m.PatientPortalComponent)
      },
      {
        path: '**',
        redirectTo: 'portal'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
