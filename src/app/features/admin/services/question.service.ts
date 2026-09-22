import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.config';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Question } from '../models/question.model';

export interface CreateQuestionRequest {
  content: string;
  image: string;
  level: number;
  questionType: number;
  quizId: number | null;
  answers: { text: string; isCorrect: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);

  getAllQuestions(page = 1, pageSize = 10, filters: QuestionFilters = {}): Observable<PagedResult<Question>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (filters.search?.trim()) params['search'] = filters.search.trim();
    if (filters.questionType !== undefined) params['questionType'] = filters.questionType;
    if (filters.assignmentStatus !== undefined) params['assignmentStatus'] = filters.assignmentStatus;
    return this.http.get<PagedResult<Question>>(`${API_BASE_URL}/api/admin/questions`, {
      params,
    });
  }

  getUnassignedQuestions(page = 1, pageSize = 10): Observable<PagedResult<Question>> {
    return this.http.get<PagedResult<Question>>(`${API_BASE_URL}/api/admin/questions/unassigned`, {
      params: { page, pageSize },
    });
  }

  getQuestionsByQuizId(quizId: number, page = 1, pageSize = 100): Observable<PagedResult<Question>> {
    return this.http.get<PagedResult<Question>>(`${API_BASE_URL}/api/admin/quizzes/${quizId}/questions`, {
      params: { page, pageSize },
    });
  }

  createQuestion(request: CreateQuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${API_BASE_URL}/api/admin/questions`, request);
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${API_BASE_URL}/api/admin/questions/${id}`);
  }

  updateQuestion(id: number, request: CreateQuestionRequest): Observable<Question> {
    return this.http.put<Question>(`${API_BASE_URL}/api/admin/questions/${id}`, request);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/admin/questions/${id}`);
  }
}

export interface QuestionFilters {
  search?: string;
  questionType?: number;
  assignmentStatus?: number;
}
