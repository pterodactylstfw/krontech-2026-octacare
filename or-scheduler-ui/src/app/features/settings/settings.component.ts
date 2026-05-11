import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private theme = inject(ThemeService);
  private authService = inject(AuthService);

  // ── Profile (cu datele reale din AuthService) ────────────────────────────────
  currentUser: User | null = null;
  profile = {
    fullName: '',
    email: '',
    role: '',
    department: '',
    phone: ''
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

  // ── Save state ───────────────────────────────────────────────────────────────
  saving = false;
  saved = false;

  ngOnInit(): void {
    // Aboneaza-te la datele utilizatorului curent
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profile = {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department || '',
          phone: user.phone || ''
        };
        console.log('✅ Profile data updated from AuthService:', this.profile);
      } else {
        console.warn('⚠️ No user loaded. Remaining with empty profile.');
      }
    });

    this.appearance.theme = this.theme.isDarkMode() ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('octacare-theme');
    if (savedTheme === 'system') {
      this.appearance.theme = 'system';
    }
  }

  onSave(): void {
    if (this.saving || this.saved) return;

    this.saving = true;

    // Simulate async save (replace with your actual service call)
    setTimeout(() => {
      this.theme.setTheme(this.appearance.theme);
      this.saving = false;
      this.saved = true;
      setTimeout(() => (this.saved = false), 2200);
    }, 900);
  }
}
