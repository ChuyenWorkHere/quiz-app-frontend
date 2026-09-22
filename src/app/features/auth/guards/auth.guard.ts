import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

function authorize(state: RouterStateSnapshot): boolean | ReturnType<Router['createUrlTree']> {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
}

function authorizeAdmin(state: RouterStateSnapshot): boolean | ReturnType<Router['createUrlTree']> {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return authService.hasRole('Admin')
    ? true
    : router.createUrlTree(['/user/dashboard']);
}

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
  authorize(state);

export const authChildGuard: CanActivateChildFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
  authorize(state);

export const adminGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
  authorizeAdmin(state);

export const adminChildGuard: CanActivateChildFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
  authorizeAdmin(state);

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return true;

  return router.createUrlTree([
    authService.hasRole('Admin') ? '/admin/dashboard' : '/user/dashboard',
  ]);
};
