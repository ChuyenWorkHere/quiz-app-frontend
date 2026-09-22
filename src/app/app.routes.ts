import { Routes } from '@angular/router';
import { ABOUT_ROUTES } from './features/about/about.routes';
import { HOME_ROUTES } from './features/home/home.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { CONTACT_ROUTES } from './features/contact/contact.routes';
import { SHOWCASE_ROUTES } from './features/showcase/showcase.routes';
import { USER_ROUTES } from './features/user/user.routes';

export const routes: Routes = [
  ...HOME_ROUTES,
  ...ABOUT_ROUTES,
  ...AUTH_ROUTES,
  ...CONTACT_ROUTES,
  ...SHOWCASE_ROUTES,
  ...USER_ROUTES,
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(module => module.ADMIN_ROUTES) },
  { path: '**', redirectTo: 'login' },
];
