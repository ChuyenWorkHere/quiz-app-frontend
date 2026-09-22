import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.config';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Quiz } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);

  getAllQuizzes(page = 1, pageSize = 6, filters: AdminQuizFilters = {}): Observable<PagedResult<Quiz>> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (filters.search?.trim()) params['search'] = filters.search.trim();
    if (filters.isActive !== undefined) params['isActive'] = filters.isActive;
    if (filters.sortBy) params['sortBy'] = filters.sortBy;
    return this.http.get<PagedResult<Quiz>>(`${API_BASE_URL}/api/admin/quizzes`, {
      params,
    });
  }

  getActiveQuizzes(page = 1, pageSize = 6, filters: UserQuizFilters = {}): Observable<PagedResult<Quiz>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (filters.search?.trim()) params['search'] = filters.search.trim();
    if (filters.sortBy) params['sortBy'] = filters.sortBy;
    return this.http.get<PagedResult<Quiz>>(`${API_BASE_URL}/api/quizzes`, {
      params,
    });
  }

  getActiveQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${API_BASE_URL}/api/quizzes/${id}`);
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${API_BASE_URL}/api/admin/quizzes/${id}`);
  }

  createQuiz(request: QuizRequest): Observable<Quiz> {
    return this.http.post<Quiz>(`${API_BASE_URL}/api/admin/quizzes`, request);
  }

  updateQuiz(id: number, request: QuizRequest): Observable<Quiz> {
    return this.http.put<Quiz>(`${API_BASE_URL}/api/admin/quizzes/${id}`, request);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/admin/quizzes/${id}`);
  }

  deleteQuizzes(ids: number[]): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/api/admin/quizzes/bulk-delete`, ids);
  }
}

export interface QuizRequest {
  title: string;
  description: string;
  duration: number;
  image: string;
  passedScore: number;
  isActive: boolean;
  questionIds: number[];
}

export interface AdminQuizFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: 'recent' | 'title' | 'questions' | 'duration';
}

export interface UserQuizFilters {
  search?: string;
  sortBy?: 'popular' | 'duration' | 'recent' | 'rated';
}
