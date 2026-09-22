import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { guestGuard } from '../auth/guards/auth.guard';
export const HOME_ROUTES: Routes = [
  { path: '', pathMatch: 'full', component: HomePageComponent, canActivate: [guestGuard], title: 'QuizFlow | Master Any Subject' },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
];
