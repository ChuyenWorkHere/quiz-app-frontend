import { Routes } from '@angular/router';
import { guestGuard } from '../auth/guards/auth.guard';

export const ABOUT_ROUTES: Routes = [
  {
    path: 'about',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/about/about-page.component').then(module => module.AboutPageComponent),
    title: 'About QuizFlow | Active Learning',
  },
];
