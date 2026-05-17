import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request all rooms', () => {
    service.getAll().subscribe();

    const req = httpMock.expectOne('/api/rooms');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create room', () => {
    const payload = { name: 'OR-1', floor: 1 };

    service.create(payload).subscribe();

    const req = httpMock.expectOne('/api/rooms');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', roomType: 'GENERAL', status: 'AVAILABLE', sterilizationTimeMinutes: 20, equipment: [], capacity: 1, ...payload });
  });

  it('should update and delete room by id', () => {
    const payload = { name: 'OR-2' };

    service.update('77', payload).subscribe();
    const updateReq = httpMock.expectOne('/api/rooms/77');
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(payload);
    updateReq.flush({ id: '77', roomType: 'GENERAL', status: 'AVAILABLE', floor: 1, sterilizationTimeMinutes: 20, equipment: [], capacity: 1, ...payload });

    service.delete('77').subscribe();
    const deleteReq = httpMock.expectOne('/api/rooms/77');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
