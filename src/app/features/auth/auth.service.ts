import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, delay, map, of, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/api.config';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expriresAt: string;
  user: AuthenticatedUser;
}

export interface RegistrationDetails {
  fullName: string;
  email: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSignal = signal<AuthenticatedUser | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.currentUserSignal.set(this.readSession()?.user ?? null);
  }

  isAuthenticated(): boolean {
    const session = this.readSession();
    if (!session?.accessToken) return false;

    const expiresAt = Date.parse(session.expriresAt);
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      this.signOut();
      return false;
    }
    return true;
  }

  getSession(): LoginResponse | null {
    return this.readSession();
  }

  updateCurrentUser(user: AuthenticatedUser): void {
    const storage = localStorage.getItem('quizAuth') ? localStorage : sessionStorage;
    const session = this.readSession();
    if (!session) return;
    const updatedSession = { ...session, user };
    storage.setItem('quizAuth', JSON.stringify(updatedSession));
    this.currentUserSignal.set(user);
  }

  hasRole(role: string): boolean {
    const roles = this.currentUserSignal()?.roles ?? [];
    return roles.some(userRole => userRole.toLowerCase() === role.toLowerCase());
  }

  signIn(credentials: LoginCredentials): Observable<LoginResponse> {
    const { email, password, rememberMe } = credentials;
    return this.http.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, { email, password }).pipe(
      tap(response => this.storeSession(response, rememberMe)),
    );
  }

  register(details: RegistrationDetails): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/api/auth/register`, details).pipe(
      tap(response => this.storeSession(response, false))
    );
  }

  signOut(): void {
    localStorage.removeItem('quizAuth');
    sessionStorage.removeItem('quizAuth');
    this.currentUserSignal.set(null);
  }

  private storeSession(response: LoginResponse, rememberMe: boolean): void {
    this.signOut();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('quizAuth', JSON.stringify(response));
    this.currentUserSignal.set(response.user);
  }

  private readSession(): LoginResponse | null {
    const value = localStorage.getItem('quizAuth') ?? sessionStorage.getItem('quizAuth');
    if (!value) return null;

    try {
      return JSON.parse(value) as LoginResponse;
    } catch {
      this.signOut();
      return null;
    }
  }
}
