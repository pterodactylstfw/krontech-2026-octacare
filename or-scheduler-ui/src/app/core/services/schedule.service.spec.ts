import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request generated schedule with query params', () => {
    service.generateSchedule('2026-01-01', '2026-01-02').subscribe();

    const req = httpMock.expectOne(r => r.method === 'POST' && r.url === '/api/schedule/generate');
    expect(req.request.params.get('startDate')).toBe('2026-01-01');
    expect(req.request.params.get('endDate')).toBe('2026-01-02');
    req.flush({ ok: true });
  });

  it('should request schedule interval with start/end params', () => {
    service.getSchedule('2026-01-01T00:00:00', '2026-01-01T23:59:59').subscribe();

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === '/api/schedule');
    expect(req.request.params.get('start')).toBe('2026-01-01T00:00:00');
    expect(req.request.params.get('end')).toBe('2026-01-01T23:59:59');
    req.flush([]);
  });

  it('should emit schedule update notifications', () => {
    let calls = 0;
    service.scheduleUpdated$.subscribe(() => calls++);

    service.emitScheduleUpdate();
    service.emitScheduleUpdate();

    expect(calls).toBe(2);
  });
});
