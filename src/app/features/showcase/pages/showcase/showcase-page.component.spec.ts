import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { ShowcasePageComponent } from './showcase-page.component';
import { PagedResult } from '../../../../core/models/paged-result.model';
import { Quiz } from '../../../home/models/quiz.model';

describe('Showcase API catalog', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShowcasePageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  function request(page: number) {
    return http.expectOne(`${API_BASE_URL}/api/quizzes?page=${page}&pageSize=6`);
  }

  function response(page: number): PagedResult<Quiz> {
    return {
      items: [{ id: page, title: `Quiz page ${page}`, description: 'API description',
        duration: 20, numberOfQuestions: 12, attempts: 5, passRate: 80,
        image: page === 1 ? 'https://example.com/quiz.jpg' : '', isActive: true,
        passedScore: 8, createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z' }],
      page, pageSize: 6, totalPages: 2, totalItems: 7,
    };
  }

  it('renders API data and pagination, including retrying a failed second page', () => {
    const fixture = TestBed.createComponent(ShowcasePageComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(element.textContent).toContain('Loading quizzes...');
    request(1).flush(response(1));
    fixture.detectChanges();
    expect(element.querySelector('.quiz-card')?.textContent).toContain('Quiz page 1');
    expect(element.querySelector('.quiz-image')?.getAttribute('src')).toBe('https://example.com/quiz.jpg');
    expect(element.querySelector('.metrics-grid')?.textContent).toContain('7');
    const previous = element.querySelector<HTMLButtonElement>('.pagination button:first-child')!;
    const next = element.querySelector<HTMLButtonElement>('.pagination button:last-child')!;
    expect(previous.disabled).toBe(true);
    next.click();
    fixture.detectChanges();
    expect(next.disabled).toBe(true);
    request(2).flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelector('.quiz-card')).toBeNull();
    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    request(2).flush(response(2));
    fixture.detectChanges();
    expect(element.querySelector('.quiz-card')?.textContent).toContain('Quiz page 2');
    expect(element.querySelector('.quiz-image')).toBeNull();
    expect(element.querySelector('.cover-art')).not.toBeNull();
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);
    previous.click();
    request(1).flush(response(1));
    fixture.detectChanges();
    expect(element.querySelector('.pagination')?.textContent).toContain('Page 1 of 2');
  });

  it('filters the current page locally and handles an empty API response', () => {
    const fixture = TestBed.createComponent(ShowcasePageComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    request(1).flush(response(1));
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = 'unmatched';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No Quizzes Found');
    expect(element.querySelector('.pagination')).not.toBeNull();
    element.querySelector<HTMLButtonElement>('.empty-state button')!.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.quiz-card').length).toBe(1);
    element.querySelector<HTMLButtonElement>('.pagination button:last-child')!.click();
    request(2).flush({ items: [], page: 2, pageSize: 6, totalItems: 0, totalPages: 0 });
    fixture.detectChanges();
    expect(element.textContent).toContain('No Quizzes Found');
    expect(element.querySelector('.pagination')).toBeNull();
  });
});
