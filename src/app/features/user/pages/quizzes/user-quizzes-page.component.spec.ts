import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { UserQuizzesPageComponent } from './user-quizzes-page.component';

describe('UserQuizzesPageComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserQuizzesPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads active quizzes using backend popularity sorting', () => {
    const fixture = TestBed.createComponent(UserQuizzesPageComponent);
    fixture.detectChanges();

    http.expectOne(`${API_BASE_URL}/api/quizzes?page=1&pageSize=6&sortBy=popular`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });
  });

  it('debounces search and requests the first filtered database page', async () => {
    const fixture = TestBed.createComponent(UserQuizzesPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/quizzes?page=1&pageSize=6&sortBy=popular`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).changeSearch(' backend ');
    await new Promise(resolve => setTimeout(resolve, 350));

    http.expectOne(`${API_BASE_URL}/api/quizzes?page=1&pageSize=6&search=backend&sortBy=popular`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });
  });

  it('requests backend sorting instead of sorting the current page', () => {
    const fixture = TestBed.createComponent(UserQuizzesPageComponent);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/quizzes?page=1&pageSize=6&sortBy=popular`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });

    (fixture.componentInstance as any).changeSort('duration');
    http.expectOne(`${API_BASE_URL}/api/quizzes?page=1&pageSize=6&sortBy=duration`).flush({
      items: [], page: 1, pageSize: 6, totalPages: 0, totalItems: 0,
    });
  });
});
