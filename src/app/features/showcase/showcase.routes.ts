import { Routes } from '@angular/router';
import { ShowcasePageComponent } from './pages/showcase/showcase-page.component';
import { guestGuard } from '../auth/guards/auth.guard';
export const SHOWCASE_ROUTES: Routes = [{ path: 'quizzes', component: ShowcasePageComponent, canActivate: [guestGuard], title: 'Explore Quizzes | QuizFlow' }];
