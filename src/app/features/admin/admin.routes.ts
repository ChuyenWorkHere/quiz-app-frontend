import { Routes } from '@angular/router';
import { adminChildGuard, adminGuard } from '../auth/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardPageComponent } from './pages/dashboard/admin-dashboard-page.component';
import { AdminQuizManagementPageComponent } from './pages/quiz-management/admin-quiz-management-page.component';
import { AdminCreateQuizPageComponent } from './pages/create-quiz/admin-create-quiz-page.component';
import { AdminEditQuizPageComponent } from './pages/edit-quiz/admin-edit-quiz-page.component';
import { AdminCreateQuestionPageComponent } from './pages/create-question/admin-create-question-page.component';
import { AdminEditQuestionPageComponent } from './pages/edit-question/admin-edit-question-page.component';
import { AdminQuestionDetailPageComponent } from './pages/question-detail/admin-question-detail-page.component';
import { AdminUserManagementPageComponent } from './pages/user-management/admin-user-management-page.component';
import { AdminUserDetailPageComponent } from './pages/user-detail/admin-user-detail-page.component';
import { AdminQuestionBankPageComponent } from './pages/question-bank/admin-question-bank-page.component';
import { AdminQuizDetailPageComponent } from './pages/quiz-detail/admin-quiz-detail-page.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardPageComponent, title: 'Admin Dashboard | QuizFlow' },
      { path: 'quizzes/new', component: AdminCreateQuizPageComponent, title: 'Create Quiz | QuizFlow' },
      { path: 'quizzes/:id/edit', component: AdminEditQuizPageComponent, title: 'Edit Quiz | QuizFlow' },
      { path: 'quizzes/:id', component: AdminQuizDetailPageComponent, title: 'Quiz Detail | QuizFlow' },
      { path: 'quizzes', component: AdminQuizManagementPageComponent, title: 'Quiz Management | QuizFlow' },
      { path: 'questions/new', component: AdminCreateQuestionPageComponent, title: 'Create Question | QuizFlow' },
      { path: 'questions/:id/edit', component: AdminEditQuestionPageComponent, title: 'Edit Question | QuizFlow' },
      { path: 'questions/:id', component: AdminQuestionDetailPageComponent, title: 'Question Details | QuizFlow' },
      { path: 'questions', component: AdminQuestionBankPageComponent, title: 'Question Bank | QuizFlow' },
      { path: 'users/:id', component: AdminUserDetailPageComponent, title: 'User Details | QuizFlow' },
      { path: 'users', component: AdminUserManagementPageComponent, title: 'User Management | QuizFlow' }
    ]
  }
];
