import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell-layout.html',
  styleUrls: ['./shell-layout.scss']
})
export class ShellLayoutComponent {

  navItems = [
    { label: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { label: 'Operating Rooms', icon: 'building', route: '/operating-rooms' },
    { label: 'Surgeons', icon: 'user-md', route: '/surgeons' },
    { label: 'Staff', icon: 'users', route: '/staff' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
    { label: 'Reports', icon: 'file', route: '/reports' },
  ];
}