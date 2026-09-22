import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import { API_BASE_URL } from '../api.config';

const PUBLIC_AUTH_ENDPOINTS = [
  `${API_BASE_URL}/api/auth/login`,
  `${API_BASE_URL}/api/auth/register`,
];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isQuizFlowApi = request.url.startsWith(API_BASE_URL);
  const urlWithoutQuery = request.url.split('?')[0];
  const publicQuizzesUrl = `${API_BASE_URL}/api/quizzes`;
  const isPublicQuizRequest = request.method === 'GET' &&
    (urlWithoutQuery === publicQuizzesUrl || /^\/\d+$/.test(urlWithoutQuery.slice(publicQuizzesUrl.length)));
  const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.includes(urlWithoutQuery) || isPublicQuizRequest;

  if (!isQuizFlowApi || isPublicAuthRequest) {
    return next(request);
  }

  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    return next(request);
  }

  const accessToken = authService.getSession()?.accessToken;
  if (!accessToken) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  }));
};
