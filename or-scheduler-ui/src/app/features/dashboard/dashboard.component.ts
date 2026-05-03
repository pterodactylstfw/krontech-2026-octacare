import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { DashboardData, TimelineBlock } from './models/dashboard.models';
import { AlertCountPipe } from '../../shared/pipes/alert-count.pipe';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  readonly theme = inject(ThemeService);

  data = this.dashboardService.data;
  currentTime = signal('');
  currentDate = signal('');

  private clockInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 10000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    this.currentDate.set(now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getOrStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      sterilizing: 'Sterilizing',
      available: 'Available',
      maintenance: 'Maintenance'
    };
    return labels[status] ?? status;
  }

  getAlertIcon(severity: string): string {
    if (severity === 'critical') return '▲';
    if (severity === 'warning') return '◆';
    return '●';
  }

  isEmptyBlock(block: TimelineBlock): boolean {
    return block.colorType === 'empty';
  }

  trackById(index: number, item: { id?: number }): number {
    return item.id ?? index;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
