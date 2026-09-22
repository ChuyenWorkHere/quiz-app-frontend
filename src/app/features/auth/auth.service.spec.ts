import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../core/api.config';
import { AuthService, LoginResponse } from './auth.service';

describe('AuthService login', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const response: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expriresAt: '2026-09-09T12:00:00Z',
    user: {
      id: 'user-1', username: 'student', fullName: 'Student User', email: 'student@example.com', status: 1,
      createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z', roles: ['User'],
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('posts the ASP.NET login payload and persists remembered sessions', () => {
    service.signIn({ email: 'student@example.com', password: 'Password@123', rememberMe: true }).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/api/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'student@example.com', password: 'Password@123' });
    request.flush(response);

    expect(JSON.parse(localStorage.getItem('quizAuth')!)).toEqual(response);
    expect(sessionStorage.getItem('quizAuth')).toBeNull();
    expect(service.hasRole('user')).toBe(true);
    expect(service.hasRole('Admin')).toBe(false);
  });

  it('uses session storage when remember me is disabled', () => {
    service.signIn({ email: 'student@example.com', password: 'Password@123', rememberMe: false }).subscribe();
    http.expectOne(`${API_BASE_URL}/api/auth/login`).flush(response);

    expect(JSON.parse(sessionStorage.getItem('quizAuth')!)).toEqual(response);
    expect(localStorage.getItem('quizAuth')).toBeNull();
  });
});
