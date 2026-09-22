import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login-page.component';
import { RegistrationPageComponent } from './pages/register/registration-page.component';
import { guestGuard } from './guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPageComponent, canActivate: [guestGuard], title: 'Sign in | QuizFlow' },
  { path: 'register', component: RegistrationPageComponent, canActivate: [guestGuard], title: 'Create account | QuizFlow' },
];
