import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { API_BASE_URL } from '../../../../core/api.config';
import { AdminCreateQuestionPageComponent } from './admin-create-question-page.component';

@Component({ template: '' })
class QuestionsPageStubComponent {}

describe('AdminCreateQuestionPageComponent', () => {
  it('maps the form value to the create-question API request', () => {
    TestBed.configureTestingModule({
      imports: [AdminCreateQuestionPageComponent],
      providers: [provideRouter([{ path: 'admin/questions', component: QuestionsPageStubComponent }]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(AdminCreateQuestionPageComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=1000`).flush({ items: [], page: 1, pageSize: 1000, totalPages: 0, totalItems: 0 });

    (fixture.componentInstance as any).handleSubmit({ mode: 'finish', value: {
      type: 'multiple', prompt: 'Choose every correct option', rationale: '', hint: '', shuffle: true,
      booleanAnswer: true, quizId: null, level: 0, image: '', options: [
        { id: 1, text: 'Option A', feedback: '', correct: true },
        { id: 2, text: 'Option B', feedback: '', correct: false },
      ],
    }});

    const request = http.expectOne(`${API_BASE_URL}/api/admin/questions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ content: 'Choose every correct option', image: '', level: 0,
      questionType: 1, quizId: null, answers: [
        { text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false },
      ] });
    request.flush({});
    http.verify();
  });
});
