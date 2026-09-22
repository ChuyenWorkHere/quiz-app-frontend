import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { Quiz } from '../../../home/models/quiz.model';
import { AdminQuizManagementPageComponent } from './admin-quiz-management-page.component';

describe('AdminQuizManagementPageComponent', () => {
  let http: HttpTestingController;
  const quiz = (id: number, isActive: boolean): Quiz => ({
    id, title: `Quiz ${id}`, description: `Description ${id}`, duration: 20,
    image: '', isActive, passedScore: 8, attempts: 4, numberOfQuestions: 10,
    passRate: 75, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-13T00:00:00Z',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminQuizManagementPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads all quiz statuses and changes API pages', () => {
    const fixture = TestBed.createComponent(AdminQuizManagementPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&sortBy=recent`).flush({
      items: [quiz(1, true), quiz(2, false)], page: 1, pageSize: 6, totalPages: 2, totalItems: 8,
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Quiz 1');
    expect(element.textContent).toContain('Active');
    expect(element.textContent).toContain('Inactive');
    expect(element.textContent).toContain('of 8 quizzes');

    element.querySelectorAll<HTMLButtonElement>('nav[aria-label="Pagination"] button')[2].click();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=2&pageSize=6&sortBy=recent`).flush({
      items: [quiz(8, false)], page: 2, pageSize: 6, totalPages: 2, totalItems: 8,
    });
    fixture.detectChanges();
    expect(element.textContent).toContain('Quiz 8');
  });

  it('sends status and sorting filters to the backend before pagination', () => {
    const fixture = TestBed.createComponent(AdminQuizManagementPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&sortBy=recent`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).changeStatus('active');
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&isActive=true&sortBy=recent`).flush({
      items: [quiz(1, true)], page: 1, pageSize: 6, totalPages: 1, totalItems: 1,
    });

    (fixture.componentInstance as any).changeSort('title');
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&isActive=true&sortBy=title`).flush({
      items: [quiz(1, true)], page: 1, pageSize: 6, totalPages: 1, totalItems: 1,
    });
  });

  it('deletes a quiz through the API and reloads the current page', () => {
    const fixture = TestBed.createComponent(AdminQuizManagementPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&sortBy=recent`).flush({
      items: [quiz(3, false)], page: 1, pageSize: 6, totalPages: 1, totalItems: 1,
    });

    (fixture.componentInstance as any).openDelete(quiz(3, false));
    (fixture.componentInstance as any).confirmDelete();
    const deletion = http.expectOne(`${API_BASE_URL}/api/admin/quizzes/3`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);

    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&sortBy=recent`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });
  });

  it('shows the backend reason when a quiz has student attempts', () => {
    const fixture = TestBed.createComponent(AdminQuizManagementPageComponent);
    fixture.detectChanges();
    const attemptedQuiz = quiz(4, true);
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=6&sortBy=recent`).flush({
      items: [attemptedQuiz], page: 1, pageSize: 6, totalPages: 1, totalItems: 1,
    });

    (fixture.componentInstance as any).openDelete(attemptedQuiz);
    (fixture.componentInstance as any).confirmDelete();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes/4`).flush(
      { detail: 'This quiz cannot be deleted because it already has student attempts' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('This quiz cannot be deleted because it already has student attempts');
  });
});
