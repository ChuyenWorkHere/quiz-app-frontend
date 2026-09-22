import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent API catalog', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function request() {
    return http.expectOne(`${API_BASE_URL}/api/quizzes?page=1&pageSize=6`);
  }

  it('requests six quizzes and renders API fields, with local search', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Loading quizzes...');
    const pending = request();
    expect(pending.request.method).toBe('GET');
    pending.flush({
      items: [{ id: 42, title: 'ASP.NET basics', description: 'Web APIs', duration: 15,
        numberOfQuestions: 10, attempts: 123, passRate: 80, image: 'https://example.com/quiz.jpg',
        isActive: true, passedScore: 8, createdAt: '2026-09-09T00:00:00Z',
        updatedAt: '2026-09-09T00:00:00Z' }],
      page: 1, pageSize: 6, totalPages: 1, totalItems: 1,
    });
    fixture.detectChanges();
    const card = element.querySelector('app-quiz-card')!;
    expect(card.textContent).toContain('ASP.NET basics');
    expect(card.querySelector('img')?.getAttribute('src')).toBe('https://example.com/quiz.jpg');
    expect(card.textContent).toContain('15 Mins');
    expect(card.textContent).toContain('10 Questions');
    expect(card.textContent).toContain('123 attempts');
    expect(card.textContent).toContain('80% pass rate');
    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = 'unmatched';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.querySelector('app-quiz-card')).toBeNull();
    expect(element.textContent).toContain('No Quizzes Currently Available');
  });

  it('shows an error and retries successfully with an empty result', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    request().flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Unable to load quizzes');
    expect(element.textContent).not.toContain('No Quizzes Currently Available');
    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Loading quizzes...');
    request().flush({ items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0 });
    fixture.detectChanges();
    expect(element.textContent).toContain('No Quizzes Currently Available');
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });
});
