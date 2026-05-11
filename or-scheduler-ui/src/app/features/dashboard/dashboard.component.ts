import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { DashboardData, TimelineBlock } from './models/dashboard.models';
import { AlertCountPipe } from '../../shared/pipes/alert-count.pipe';
import { ThemeService } from '../../core/theme/theme.service';
import { jsPDF } from 'jspdf';


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




  generateReport(): void {
    const d = this.data();
    if (!d) return;

    const doc = new jsPDF();
    const now = new Date();
    let y = 20;


    // ── Header ──
    doc.setFillColor(10, 13, 20);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('OR Scheduler — Daily Report', 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }), 196, 18, { align: 'right' });

    y = 44;

    // ── KPIs ──
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("TODAY'S OVERVIEW", 14, y - 6);

    const kpiColors: Record<string, [number, number, number]> = {
      blue: [59, 127, 255],
      green: [34, 197, 94],
      amber: [245, 158, 11],
      red: [239, 68, 68],
    };

    const checkPage = (neededSpace: number) => {
      if (y + neededSpace > 265) {
        doc.addPage();
        y = 20;
      }
    };

    d.kpis.forEach((kpi, i) => {
      const x = 14 + i * 46;
      const [r, g, b] = kpiColors[kpi.accent] ?? [100, 116, 139];
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(x, y - 4, 43, 26, 3, 3, 'F');
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.8);
      doc.line(x, y - 4, x + 43, y - 4);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.label.toUpperCase(), x + 3, y + 4);
      doc.setTextColor(r, g, b);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.value, x + 3, y + 15);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const cleanDelta = kpi.delta.replace('↑', '+').replace('↓', '-');
      doc.text(cleanDelta, x + 3, y + 22);
    });

    y += 38;

    // ── Operating Rooms ──
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OPERATING ROOMS', 14, y);
    y += 6;

    const statusColors: Record<string, [number, number, number]> = {
      active: [59, 127, 255],
      sterilizing: [245, 158, 11],
      available: [34, 197, 94],
      maintenance: [107, 114, 128],
    };

    d.operatingRooms.forEach(or => {
       checkPage(22);
      const [r, g, b] = statusColors[or.status] ?? [100, 116, 139];
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${or.name}`, 18, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(`${or.specialty} · ${or.floor}`, 18, y + 13);
      // utilization bar
      doc.setFillColor(220, 226, 236);
      doc.roundedRect(70, y + 6, 80, 3, 1, 1, 'F');
      doc.setFillColor(r, g, b);
      doc.roundedRect(70, y + 6, 80 * or.utilization / 100, 3, 1, 1, 'F');
      doc.setTextColor(r, g, b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${or.utilization}%`, 154, y + 9);
      // status label
      doc.setFontSize(7);
      doc.text(or.status.toUpperCase(), 168, y + 9);
      // detail
      if (or.currentSurgeon) {
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`${or.currentSurgeon} · ends ${or.endsAt}`, 70, y + 14);
      }
      y += 21;
    });

    y += 4;

    // ── Surgeons ──
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SURGEONS ON DUTY', 14, y);
    y += 6;

    d.surgeons.forEach(s => {
       checkPage(15);
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(14, y, 182, 12, 2, 2, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(s.name, 18, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(s.department, 90, y + 8);
      const ops = s.status === 'on-leave' ? 'On Leave' : `${s.surgeriesToday} surgeries`;
      doc.text(ops, 165, y + 8, { align: 'right' });
      y += 14;
    });

    y += 4;

    // ── Alerts ──
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    checkPage(d.alerts.length * 16 + 20);
    doc.text('ACTIVE ALERTS', 14, y);
    y += 6;

    const alertColors: Record<string, [number, number, number]> = {
      critical: [239, 68, 68],
      warning: [245, 158, 11],
      info: [59, 127, 255],
    };

    d.alerts.forEach(alert => {
      const [r, g, b] = alertColors[alert.severity] ?? [100, 116, 139];
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
      doc.setFillColor(r, g, b);
      doc.roundedRect(14, y, 2, 14, 1, 1, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(alert.message, 20, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(alert.detail, 20, y + 11);
      y += 16;
    });

    y += 4;

    // ── Mini Stats ──
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    checkPage(40);
    doc.text('WEEKLY STATISTICS', 14, y);
    y += 6;

    const statColors: Record<string, [number, number, number]> = {
      blue: [59, 127, 255],
      green: [34, 197, 94],
      amber: [245, 158, 11],
    };

    d.miniStats.forEach((stat, i) => {
      const x = 14 + i * 62;
      const [r, g, b] = statColors[stat.colorClass] ?? [100, 116, 139];
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(x, y, 59, 22, 2, 2, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + 3, y + 6);
      doc.setTextColor(r, g, b);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value, x + 3, y + 15);
      doc.setFillColor(220, 226, 236);
      doc.roundedRect(x + 3, y + 17, 50, 2, 1, 1, 'F');
      doc.setFillColor(r, g, b);
      doc.roundedRect(x + 3, y + 17, 50 * stat.progressPct / 100, 2, 1, 1, 'F');
    });

    y += 30;

    // ── AI Insight ──
    checkPage(30);
    doc.setFillColor(235, 241, 255);
    doc.roundedRect(14, y, 182, 22, 3, 3, 'F');
    doc.setDrawColor(59, 127, 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, 182, 22, 3, 3, 'S');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('AI INSIGHTS', 18, y + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(d.aiInsight, 170);
    doc.text(lines, 18, y + 14);

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    doc.setPage(pageCount);
    doc.setFillColor(10, 13, 20);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text('OR Scheduler · Generated by OctaCare', 14, 291);
    doc.text(`${this.currentTime()} · ${this.currentDate()}`, 196, 291, { align: 'right' });

    doc.save(`or-report-${now.toISOString().slice(0, 10)}.pdf`);
  }
}

