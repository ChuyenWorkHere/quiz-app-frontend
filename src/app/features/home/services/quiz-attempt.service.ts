import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.config';
import { AttemptHistoryResult } from '../../user/models/dashboard.model';
import { QuizAttemptResult, QuizAttemptReview, QuizAttemptSession, SubmitAttemptRequest } from '../../user/models/quiz-attempt.model';

@Injectable({ providedIn: 'root' })
export class QuizAttemptService {
  private readonly http = inject(HttpClient);

  getQuizAttemptsByUserId(
    userId: string,
    page = 1,
    pageSize = 6,
    search = '',
    isPassed?: boolean,
  ): Observable<AttemptHistoryResult> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (search.trim()) params['search'] = search.trim();
    if (isPassed !== undefined) params['isPassed'] = isPassed;
    return this.http.get<AttemptHistoryResult>(`${API_BASE_URL}/api/attempts/${userId}`, {
      params,
    });
  }

  startAttempt(quizId: number): Observable<QuizAttemptSession> {
    return this.http.post<QuizAttemptSession>(`${API_BASE_URL}/api/quizzes/${quizId}/attempts`, {});
  }

  getAttemptSession(attemptId: number): Observable<QuizAttemptSession> {
    return this.http.get<QuizAttemptSession>(`${API_BASE_URL}/api/attempts/${attemptId}/session`);
  }

  submitAttempt(attemptId: number, request: SubmitAttemptRequest): Observable<QuizAttemptResult> {
    return this.http.post<QuizAttemptResult>(`${API_BASE_URL}/api/attempts/${attemptId}/submit`, request);
  }

  getAttemptResult(attemptId: number): Observable<QuizAttemptResult> {
    return this.http.get<QuizAttemptResult>(`${API_BASE_URL}/api/attempts/${attemptId}/result`);
  }

  getAttemptReview(attemptId: number): Observable<QuizAttemptReview> {
    return this.http.get<QuizAttemptReview>(`${API_BASE_URL}/api/attempts/${attemptId}/review`);
  }
}

