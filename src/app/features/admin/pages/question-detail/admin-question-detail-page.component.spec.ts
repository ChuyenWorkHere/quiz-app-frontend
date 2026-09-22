import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { AdminQuestionDetailPageComponent } from './admin-question-detail-page.component';

describe('AdminQuestionDetailPageComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminQuestionDetailPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '12' } } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and displays the question returned by the API', () => {
    const fixture = TestBed.createComponent(AdminQuestionDetailPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading question details...');

    http.expectOne(`${API_BASE_URL}/api/admin/questions/12`).flush({
      id: 12, content: 'Which option is correct?', image: 'https://example.com/question.png',
      level: 1, questionType: 0, quizId: 4, quizTitle: 'Backend Fundamentals',
      answers: [
        { id: 1, text: 'Correct option', isCorrect: true, questionId: 12 },
        { id: 2, text: 'Distractor', isCorrect: false, questionId: 12 },
      ],
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Which option is correct?');
    expect(text).toContain('Correct option');
    expect(text).toContain('Backend Fundamentals');
    expect(text).toContain('Single Choice');
  });

  it('deletes the loaded question and returns to the question bank', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AdminQuestionDetailPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/questions/12`).flush({
      id: 12, content: 'Question', image: '', level: 2, questionType: 1,
      quizId: null, quizTitle: '', answers: [],
    });

    (fixture.componentInstance as any).openDelete();
    (fixture.componentInstance as any).confirmDelete();
    const request = http.expectOne(`${API_BASE_URL}/api/admin/questions/12`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(navigate).toHaveBeenCalledWith(['/admin/questions']);
  });

  it('keeps the dialog open and displays a backend delete error', () => {
    const fixture = TestBed.createComponent(AdminQuestionDetailPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/questions/12`).flush({
      id: 12, content: 'Question', image: '', level: 2, questionType: 1,
      quizId: 4, quizTitle: 'Quiz', answers: [],
    });
    (fixture.componentInstance as any).openDelete();
    (fixture.componentInstance as any).confirmDelete();
    http.expectOne(`${API_BASE_URL}/api/admin/questions/12`).flush(
      { detail: 'This question cannot be deleted because it already has student answers' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('already has student answers');
  });
});
