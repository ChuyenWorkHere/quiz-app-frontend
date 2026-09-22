import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { AdminQuestionBankPageComponent } from './admin-question-bank-page.component';

describe('AdminQuestionBankPageComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminQuestionBankPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads questions with answers and changes pages', () => {
    const fixture = TestBed.createComponent(AdminQuestionBankPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading questions...');

    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`).flush({
      items: [{
        id: 12, content: 'Which answer is correct?', image: '', level: 1,
        questionType: 0, quizId: 4, quizTitle: 'Backend Fundamentals',
        answers: [
          { id: 1, text: 'Correct option', isCorrect: true, questionId: 12 },
          { id: 2, text: 'Distractor', isCorrect: false, questionId: 12 },
        ],
      }],
      page: 1, pageSize: 10, totalPages: 2, totalItems: 11,
    });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Which answer is correct?');
    expect(element.textContent).toContain('Correct option');
    expect(element.textContent).toContain('Backend Fundamentals');
    expect(element.textContent).toContain('of 11 questions');

    element.querySelectorAll<HTMLButtonElement>('.pagination nav button')[2].click();
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=2&pageSize=10`).flush({
      items: [], page: 2, pageSize: 10, totalPages: 2, totalItems: 11,
    });
  });

  it('shows an error and retries the request', () => {
    const fixture = TestBed.createComponent(AdminQuestionBankPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Unable to load questions');
    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`).flush({
      items: [], page: 1, pageSize: 10, totalPages: 0, totalItems: 0,
    });
  });

  it('sends search and question type filters to the backend', async () => {
    const fixture = TestBed.createComponent(AdminQuestionBankPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`).flush({
      items: [], page: 1, pageSize: 10, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).changeSearch('database');
    await new Promise(resolve => setTimeout(resolve, 350));
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10&search=database`).flush({
      items: [], page: 1, pageSize: 10, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).changeType('1');
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10&search=database&questionType=1`).flush({
      items: [], page: 1, pageSize: 10, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).changeAssignmentStatus('2');
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10&search=database&questionType=1&assignmentStatus=2`).flush({
      items: [], page: 1, pageSize: 10, totalPages: 0, totalItems: 0,
    });
  });

  it('deletes a question after confirmation and reloads the current page', () => {
    const fixture = TestBed.createComponent(AdminQuestionBankPageComponent);
    fixture.detectChanges();
    const question = {
      id: 12, content: 'Question to delete', image: '', level: 1,
      questionType: 0, quizId: 4, quizTitle: 'Backend Fundamentals',
      answers: [{ id: 1, text: 'Answer', isCorrect: true, questionId: 12 }],
    };
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`).flush({
      items: [question], page: 1, pageSize: 10, totalPages: 1, totalItems: 1,
    });
    fixture.detectChanges();

    (fixture.componentInstance as any).openDelete(question);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Delete Question');
    (fixture.componentInstance as any).confirmDelete();

    const deleteRequest = http.expectOne(`${API_BASE_URL}/api/admin/questions/12`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`).flush({
      items: [], page: 1, pageSize: 10, totalPages: 0, totalItems: 0,
    });
  });

  it('shows the backend reason when a question cannot be deleted', () => {
    const fixture = TestBed.createComponent(AdminQuestionBankPageComponent);
    fixture.detectChanges();
    const question = {
      id: 12, content: 'Answered question', image: '', level: 1,
      questionType: 0, quizId: 4, quizTitle: 'Backend Fundamentals', answers: [],
    };
    http.expectOne(`${API_BASE_URL}/api/admin/questions?page=1&pageSize=10`).flush({
      items: [question], page: 1, pageSize: 10, totalPages: 1, totalItems: 1,
    });

    (fixture.componentInstance as any).openDelete(question);
    (fixture.componentInstance as any).confirmDelete();
    http.expectOne(`${API_BASE_URL}/api/admin/questions/12`).flush(
      { detail: 'This question cannot be deleted because it already has student answers' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'This question cannot be deleted because it already has student answers',
    );
  });
});
