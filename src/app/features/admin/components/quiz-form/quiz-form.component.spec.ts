import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { QuizFormComponent } from './quiz-form.component';

@Component({ template: '' })
class QuizListStubComponent {}

describe('QuizFormComponent curriculum selection', () => {
  it('sends the assigned question ids when creating a quiz', () => {
    TestBed.configureTestingModule({
      imports: [QuizFormComponent],
      providers: [provideRouter([{ path: 'admin/quizzes', component: QuizListStubComponent }]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(QuizFormComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/questions/unassigned?page=1&pageSize=1000`).flush({
      items: [{ id: 11, content: 'Database question', image: '', level: 1, questionType: 0, quizId: null, quizTitle: '', answers: [] }],
      page: 1, pageSize: 1000, totalPages: 1, totalItems: 1,
    });

    const component = fixture.componentInstance as any;
    component.title.set('Quiz with curriculum');
    component.addQuestion(component.questions()[0]);
    component.publish();

    const request = http.expectOne(`${API_BASE_URL}/api/admin/quizzes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.questionIds).toEqual([11]);
    request.flush({});
    http.verify();
  });
});
