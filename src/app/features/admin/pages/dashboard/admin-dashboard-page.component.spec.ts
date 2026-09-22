import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/api.config';
import { AdminDashboardPageComponent } from './admin-dashboard-page.component';

describe('AdminDashboardPageComponent', () => {
  it('loads all quizzes and derives dashboard metrics', () => {
    TestBed.configureTestingModule({
      imports: [AdminDashboardPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(AdminDashboardPageComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/admin/quizzes?page=1&pageSize=1000`).flush({
      items: [
        { id: 1, title: 'Active Admin Quiz', description: '', duration: 20, image: '', isActive: true, passedScore: 8, attempts: 5, numberOfQuestions: 10, passRate: 70, createdAt: '2026-09-01', updatedAt: '2026-09-13' },
        { id: 2, title: 'Inactive Admin Quiz', description: '', duration: 15, image: '', isActive: false, passedScore: 6, attempts: 2, numberOfQuestions: 8, passRate: 50, createdAt: '2026-09-01', updatedAt: '2026-09-12' },
      ],
      page: 1, pageSize: 1000, totalPages: 1, totalItems: 2,
    });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Active Admin Quiz');
    expect(text).toContain('Inactive Admin Quiz');
    expect(text).toContain('18');
    http.verify();
  });
});
