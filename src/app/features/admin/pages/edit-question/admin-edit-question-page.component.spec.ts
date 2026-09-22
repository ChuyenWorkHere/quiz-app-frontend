import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { AdminEditQuestionPageComponent } from './admin-edit-question-page.component';

describe('AdminEditQuestionPageComponent', () => {
  it('loads a question and sends its edited value to the API', () => {
    TestBed.configureTestingModule({
      imports: [AdminEditQuestionPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '12' } } } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminEditQuestionPageComponent);
    fixture.detectChanges();

    http.expectOne(`${API_BASE_URL}/api/admin/questions/12`).flush({
      id: 12,
      content: 'Original question',
      image: 'question.png',
      level: 1,
      questionType: 0,
      quizId: null,
      quizTitle: '',
      answers: [
        { id: 1, text: 'Correct', isCorrect: true, questionId: 12 },
        { id: 2, text: 'Incorrect', isCorrect: false, questionId: 12 },
      ],
    });
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=1000`).flush({
      items: [], page: 1, pageSize: 1000, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).handleSubmit({ mode: 'finish', value: {
      type: 'single', prompt: 'Updated question', rationale: '', hint: '', shuffle: true,
      booleanAnswer: true, quizId: null, level: 2, image: 'updated.png', options: [
        { id: 1, text: 'Updated correct', feedback: '', correct: true },
        { id: 2, text: 'Updated incorrect', feedback: '', correct: false },
      ],
    }});

    const update = http.expectOne(`${API_BASE_URL}/api/admin/questions/12`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual({
      content: 'Updated question', image: 'updated.png', level: 2, questionType: 0, quizId: null,
      answers: [
        { text: 'Updated correct', isCorrect: true },
        { text: 'Updated incorrect', isCorrect: false },
      ],
    });
    update.flush({});
    http.verify();
  });
});
