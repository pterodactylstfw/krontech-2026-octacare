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

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.reportsService.getReportsData().subscribe(data => {
      this.reportsData = data;
    });
  }
}

