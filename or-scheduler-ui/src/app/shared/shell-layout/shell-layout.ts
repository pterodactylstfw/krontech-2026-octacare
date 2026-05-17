import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/enums/user-role.enum';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { NotificationCenterComponent } from '../components/notification-center/notification-center.component';

export const routeFadeAnimation = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(4px)' }),
      animate('250ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true }),
  ])
]);

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationCenterComponent],
  templateUrl: './shell-layout.html',
  styleUrls: ['./shell-layout.scss'],
  animations: [routeFadeAnimation]
})
export class ShellLayoutComponent implements OnInit {
  // Injectări folosind pattern-ul modern Angular
  theme = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  navItems: { label: string; icon: string; route: string }[] = [];
  userName = '';
  userRole = '';
  userInitials = '';
  isAdmin = false;
  isSidebarMobileOpen = false;

  private staffNav = [
    { label: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Operating Rooms', icon: 'building', route: '/operating-rooms' },
    { label: 'Surgeons', icon: 'user-md', route: '/surgeons' },
    { label: 'Staff', icon: 'users', route: '/staff' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
    { label: 'Reports', icon: 'file', route: '/reports' },
  ];

  private surgeonNav = [
    { label: 'Dashboard', icon: 'grid', route: '/doctor' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  private nurseNav = [
    { label: 'Dashboard', icon: 'grid', route: '/nurse' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  private patientNav = [
    { label: 'My Portal', icon: 'grid', route: '/patients/portal' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Ne abonăm la userul curent și actualizăm interfața
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const role = user.role; // Folosim rolul direct din obiectul user
        this.isAdmin = role === UserRole.ADMIN;

        // Configurăm meniul în funcție de rol
        switch (role) {
          case UserRole.PATIENT:
            this.navItems = this.patientNav;
            break;
          case UserRole.SURGEON:
            this.navItems = this.surgeonNav;
            break;
          case UserRole.NURSE:
            this.navItems = this.nurseNav;
            break;
          default:
            this.navItems = this.staffNav;
            break;
        }

        // Date de profil
        this.userName = user.fullName ?? 'User';
        this.userRole = this.formatRoleDisplayName(role);
        this.userInitials = this.userName
          .split(' ')
          .map(w => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        // Forțăm o singură verificare aici, unde este sigur, pentru a evita ExpressionChanged error
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Metodă simplificată pentru animație.
   * Am eliminat detectChanges() de aici pentru a opri bucla infinită.
   */
  getRouteState(outlet: RouterOutlet): string {
    if (!outlet || !outlet.isActivated) return 'default';
    return outlet.activatedRouteData?.['animation'] ||
      outlet.activatedRoute.snapshot.url[0]?.path ||
      'default';
  }

  private formatRoleDisplayName(role: UserRole | null): string {
    switch (role) {
      case UserRole.PATIENT: return 'Patient';
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.SURGEON: return 'Surgeon';
      case UserRole.NURSE: return 'Nurse';
      default: return 'Staff';
    }
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout(); // Apelează fluxul complet de logout[cite: 6]
  }

  toggleSidebar(): void {
    this.isSidebarMobileOpen = !this.isSidebarMobileOpen;
  }

  closeSidebar(): void {
    this.isSidebarMobileOpen = false;
  }
}
