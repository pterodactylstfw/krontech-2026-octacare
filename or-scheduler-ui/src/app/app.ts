import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('or-scheduler-ui');

  // Injectează AuthService ca să se inițializeze la start
  private authService = inject(AuthService);
  protected readonly theme = inject(ThemeService);
}
