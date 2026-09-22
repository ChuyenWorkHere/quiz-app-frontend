import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';
import { adminGuard, guestGuard } from './auth.guard';

describe('adminGuard', () => {
  const route = {} as ActivatedRouteSnapshot;

  function runGuard(url = '/admin/questions') {
    return TestBed.runInInjectionContext(() =>
      adminGuard(route, { url } as RouterStateSnapshot),
    );
  }

  it('allows an authenticated administrator', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => true } },
      ],
    });

    expect(runGuard()).toBe(true);
  });

  it('redirects an authenticated non-admin user to the user dashboard', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => false } },
      ],
    });

    const result = runGuard() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/user/dashboard');
  });

  it('redirects unauthenticated visitors to login with the requested admin URL', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => false, hasRole: () => false } },
      ],
    });

    const result = runGuard('/admin/quizzes/4/edit') as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fadmin%2Fquizzes%2F4%2Fedit');
  });
});

describe('guestGuard', () => {
  function runGuestGuard() {
    return TestBed.runInInjectionContext(() => guestGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/' } as RouterStateSnapshot,
    ));
  }

  it('redirects authenticated users to their user dashboard', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => false } },
      ],
    });

    const result = runGuestGuard() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/user/dashboard');
  });

  it('redirects authenticated admins to their admin dashboard', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => true } },
      ],
    });

    const result = runGuestGuard() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/admin/dashboard');
  });

  it('allows visitors without a session to open public pages', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => false, hasRole: () => false } },
      ],
    });

    expect(runGuestGuard()).toBe(true);
  });
});
