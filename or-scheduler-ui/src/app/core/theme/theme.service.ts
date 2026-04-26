import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(true);

  toggle(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }
}