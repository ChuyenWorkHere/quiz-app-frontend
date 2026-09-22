import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { UserQuizzesPageComponent } from './pages/quizzes/user-quizzes-page.component';
import { UserQuizDetailPageComponent } from './pages/quiz-detail/user-quiz-detail-page.component';
import { QuizTakingPageComponent } from './pages/quiz-taking/quiz-taking-page.component';
import { QuizAttemptReviewPageComponent } from './pages/quiz-attempt-review/quiz-attempt-review-page.component';
import { authChildGuard, authGuard } from '../auth/guards/auth.guard';
import { QuizResultsPageComponent } from './pages/quiz-results/quiz-results-page.component';
import { QuizHistoryPageComponent } from './pages/quiz-history/quiz-history-page.component';
import { UserProfilePageComponent } from './pages/profile/user-profile-page.component';

export const USER_ROUTES: Routes = [
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPageComponent, title: 'Dashboard | QuizFlow' },
      { path: 'quizzes', component: UserQuizzesPageComponent, title: 'Available Quizzes | QuizFlow' },
      { path: 'quizzes/:id/take', component: QuizTakingPageComponent, title: 'Quiz Assessment | QuizFlow' },
      { path: 'quizzes/:id/results', component: QuizResultsPageComponent, title: 'Quiz Results | QuizFlow' },
      { path: 'quizzes/:id/review', component: QuizAttemptReviewPageComponent, title: 'Attempt Review | QuizFlow' },
      { path: 'quizzes/:id', component: UserQuizDetailPageComponent, title: 'Quiz Detail | QuizFlow' },
      { path: 'quiz-history', component: QuizHistoryPageComponent, title: 'Quiz History | QuizFlow' },
      { path: 'profile', component: UserProfilePageComponent, title: 'My Profile | QuizFlow' }
    ]
  },
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'user/dashboard' }
];
