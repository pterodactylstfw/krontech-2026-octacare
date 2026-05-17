import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserRole, UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request all users with optional filters', () => {
    service.getAll(UserRole.SURGEON, 'Surgery').subscribe();

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === '/api/users');
    expect(req.request.params.get('role')).toBe(UserRole.SURGEON);
    expect(req.request.params.get('department')).toBe('Surgery');
    req.flush([]);
  });

  it('should create a user', () => {
    const payload = {
      fullName: 'John Doe',
      email: 'john@hospital.com',
      role: UserRole.NURSE,
      password: 'ChangeMe123!'
    };

    service.create(payload).subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', ...payload, createdAt: '', updatedAt: '' });
  });

  it('should update and delete user by id', () => {
    const updatePayload = {
      fullName: 'Jane Doe',
      email: 'jane@hospital.com',
      role: UserRole.ADMIN
    };

    service.update('42', updatePayload).subscribe();
    const updateReq = httpMock.expectOne('/api/users/42');
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updatePayload);
    updateReq.flush({ id: '42', ...updatePayload, createdAt: '', updatedAt: '' });

    service.delete('42').subscribe();
    const deleteReq = httpMock.expectOne('/api/users/42');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
