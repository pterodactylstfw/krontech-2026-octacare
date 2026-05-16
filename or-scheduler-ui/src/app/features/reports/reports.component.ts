import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from './services/reports.service';
import { ReportsData } from './models/reports.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportsData: ReportsData | null = null;
  loading = false;
  error: string | null = null;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loading = true;
    this.reportsService.getReportsData().subscribe({
      next: (data) => {
        console.log('✅ ReportsComponent loaded reportsData:', data);
        this.reportsData = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load reports right now.';
        this.loading = false;
      }
    });
  }
}

