import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { AdminQuizDetailPageComponent } from './admin-quiz-detail-page.component';

describe('AdminQuizDetailPageComponent', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminQuizDetailPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } }],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads the admin quiz and its assigned questions', () => {
    const fixture = TestBed.createComponent(AdminQuizDetailPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading quiz details...');

    http.expectOne(`${API_BASE_URL}/api/admin/quizzes/7`).flush({
      id: 7, title: 'Backend Quiz', description: 'Loaded from API', duration: 40, image: '', isActive: true,
      passedScore: 70, attempts: 2, numberOfQuestions: 1, passRate: 50,
      createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-15T00:00:00Z',
    });
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes/7/questions?page=1&pageSize=1000`).flush({
      items: [{ id: 9, content: 'Question from database', image: '', level: 1, questionType: 0,
        quizId: 7, quizTitle: 'Backend Quiz', answers: [{ id: 1, text: 'Correct', isCorrect: true, questionId: 9 }] }],
      page: 1, pageSize: 1000, totalPages: 1, totalItems: 1,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Backend Quiz');
    expect(fixture.nativeElement.textContent).toContain('Question from database');
    expect(fixture.nativeElement.textContent).toContain('40');
  });
});
