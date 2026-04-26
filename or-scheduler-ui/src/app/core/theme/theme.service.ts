import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(true);
  language = signal<'en' | 'ro'>('en');

  constructor() {
    const savedTheme = localStorage.getItem('octacare-theme');
    const savedLang = localStorage.getItem('octacare-lang') as 'en' | 'ro' | null;

    if (savedTheme === 'light') {
      this.isDarkMode.set(false);
    } else if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    }

    if (savedLang === 'en' || savedLang === 'ro') {
      this.language.set(savedLang);
    }
  }

  toggle(): void {
    this.isDarkMode.set(!this.isDarkMode());
    localStorage.setItem('octacare-theme', this.isDarkMode() ? 'dark' : 'light');
  }

  setTheme(theme: 'dark' | 'light' | 'system'): void {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    } else {
      this.isDarkMode.set(theme === 'dark');
    }
    localStorage.setItem('octacare-theme', theme);
  }

  setLanguage(lang: 'en' | 'ro'): void {
    this.language.set(lang);
    localStorage.setItem('octacare-lang', lang);
  }
}
