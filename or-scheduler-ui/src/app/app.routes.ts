import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/enums/user-role.enum';

export const routes: Routes = [
  // 1. Rute Publice (Accesibile fără login)
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },

  // 2. Rute Protejate de Shell Layout (Necesită login)[cite: 13, 14]
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/shell-layout/shell-layout').then((m) => m.ShellLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'doctor',
        canActivate: [roleGuard],
        data: { roles: [UserRole.SURGEON, UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/doctor/dashboard.component').then(m => m.DoctorDashboardComponent),
      },
      {
        path: 'nurse',
        canActivate: [roleGuard],
        data: { roles: [UserRole.NURSE, UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/nurse/dashboard.component').then(m => m.NurseDashboardComponent),
      },
      {
        path: 'calendar',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.SURGEON, UserRole.NURSE] },
        loadComponent: () =>
          import('./features/calendar/calendar-view/calendar-view').then((m) => m.CalendarViewComponent)
      },
      {
        path: 'operating-rooms',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/operating-rooms/operating-rooms-list/operating-rooms-list').then(
            (m) => m.OperatingRoomsListComponent
          )
      },
      {
        path: 'surgeons',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/surgeons/surgeons.component').then((m) => m.SurgeonsComponent)
      },
      {
        path: 'staff',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/staff/staff-list/staff-list').then((m) => m.StaffList)
      },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.SURGEON, UserRole.NURSE, UserRole.PATIENT] },
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent)
      },
    ]
  },

  // 3. Secțiunea Pacienți[cite: 14]
  {
    path: 'patients',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PATIENT, UserRole.ADMIN] },
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

  // 4. Fallback (Orice altă rută trimite la login)[cite: 14]
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
