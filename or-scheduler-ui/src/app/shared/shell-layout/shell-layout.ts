import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/enums/user-role.enum';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell-layout.html',
  styleUrls: ['./shell-layout.scss']
})
export class ShellLayoutComponent implements OnInit {
  theme = inject(ThemeService);
  private authService = inject(AuthService);

  navItems: { label: string; icon: string; route: string }[] = [];

  private staffNav = [
    { label: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Operating Rooms', icon: 'building', route: '/operating-rooms' },
    { label: 'Surgeons', icon: 'user-md', route: '/surgeons' },
    { label: 'Staff', icon: 'users', route: '/staff' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
    { label: 'Reports', icon: 'file', route: '/reports' },
  ];

  private patientNav = [
    { label: 'My Portal', icon: 'grid', route: '/patients/portal' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  userName = '';
  userRole = '';
  userInitials = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const role = this.authService.getCurrentUserRole();

    this.navItems = role === UserRole.PATIENT ? this.patientNav : this.staffNav;

    this.userName = user?.fullName ?? 'User';
    this.userRole = role === UserRole.PATIENT ? 'Patient'
      : role === UserRole.ADMIN ? 'Administrator'
      : role === UserRole.SURGEON ? 'Surgeon'
      : role === UserRole.NURSE ? 'Nurse'
      : 'Staff';
    this.userInitials = this.userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
