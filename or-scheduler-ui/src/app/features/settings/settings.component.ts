import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private theme = inject(ThemeService);

  // ── Profile ──────────────────────────────────────────────────────────────────
  profile = {
    fullName: 'Dr. Elena Popescu',
    email: 'elena.popescu@octacare.ro',
    role: 'Chief Surgeon',
    department: 'Orthopedics',
    phone: '+40 721 000 111'
  };

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications = {
    emailAlerts: true,
    smsAlerts: false,
    scheduleReminders: true,
    reportReady: true,
    systemUpdates: false
  };

  // ── Appearance ───────────────────────────────────────────────────────────────
  appearance = {
    theme: 'dark' as 'dark' | 'light' | 'system'
  };

  // ── System info ──────────────────────────────────────────────────────────────
  system = {
    version: '2.4.1',
    lastBackup: '2026-04-25 03:00',
    environment: 'Production'
  };

  saved = false;

  ngOnInit(): void {
    // Sync appearance state from ThemeService
    this.appearance.theme = this.theme.isDarkMode() ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('octacare-theme');
    if (savedTheme === 'system') {
      this.appearance.theme = 'system';
    }
  }

  onSave(): void {
    // Apply theme globally
    this.theme.setTheme(this.appearance.theme);

    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }
}
