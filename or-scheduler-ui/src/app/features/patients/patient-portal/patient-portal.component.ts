import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService, PatientSurgeryView, PatientProfile } from '../services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { ChatComponent } from '../../chat/chat.component';
import { filter, switchMap, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-patient-portal',
  standalone: true,
 imports: [CommonModule, ChatComponent],
  templateUrl: './patient-portal.component.html',
  styleUrls: ['./patient-portal.component.scss']
})
export class PatientPortalComponent implements OnInit, OnDestroy {
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  theme = inject(ThemeService);

  profile: PatientProfile | null = null;
  upcomingSurgeries: PatientSurgeryView[] = [];
  allSurgeries: PatientSurgeryView[] = [];
  isLoading = true;
  chatOpen = false;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Wait for authentication to be ready (user is set), then load data
    this.authService.currentUser$
      .pipe(
        filter(user => user !== null), // Wait for user to be authenticated
        switchMap(() => this.patientService.getMyProfile()),
        takeUntil(this.destroy$)
      )
      .subscribe(p => this.profile = p);

    // Similarly wait for auth before loading surgeries
    this.authService.currentUser$
      .pipe(
        filter(user => user !== null), // Wait for user to be authenticated
        switchMap(() => this.patientService.getMySurgeries()),
        takeUntil(this.destroy$)
      )
      .subscribe(s => {
        this.allSurgeries = s;
        this.upcomingSurgeries = s.filter(
          x => x.status === 'SCHEDULED' || x.status === 'IN_PROGRESS'
        );
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'IN_PROGRESS': return 'status-progress';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'Scheduled';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      case 'POSTPONED': return 'Postponed';
      default: return status;
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'EMERGENCY': return 'priority-emergency';
      case 'URGENT': return 'priority-urgent';
      case 'ELECTIVE': return 'priority-elective';
      default: return '';
    }
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
