import { Pipe, PipeTransform } from '@angular/core';
import { Alert } from '../../features/dashboard/models/dashboard.models';

@Pipe({ name: 'alertCount', standalone: true })
export class AlertCountPipe implements PipeTransform {
  transform(alerts: Alert[], severity: string): number {
    return alerts.filter(a => a.severity === severity).length;
  }
}