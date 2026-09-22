import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { UserQuizDetailPageComponent } from './user-quiz-detail-page.component';

describe('UserQuizDetailPageComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserQuizDetailPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and renders an active quiz from the route id', () => {
    const fixture = TestBed.createComponent(UserQuizDetailPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();

    const request = http.expectOne(`${API_BASE_URL}/api/quizzes/7`);
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 7, title: 'Active Quiz', description: 'Quiz description', duration: 30,
      image: 'https://example.com/quiz.jpg', isActive: true, passedScore: 8,
      attempts: 12, numberOfQuestions: 10, passRate: 75,
      createdAt: '2026-09-13T00:00:00Z', updatedAt: '2026-09-13T00:00:00Z',
    });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Active Quiz');
    expect(element.textContent).toContain('30');
    expect(element.textContent).toContain('10 Questions');
    expect(element.querySelector<HTMLImageElement>('.cover img')?.src).toBe('https://example.com/quiz.jpg');
  });

  it('shows the unavailable state when the active quiz is not found', () => {
    const fixture = TestBed.createComponent(UserQuizDetailPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/quizzes/7`)
      .flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('This quiz is unavailable or has been deactivated.');
  });
});
