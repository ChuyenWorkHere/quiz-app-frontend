import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.config';
import { AuthenticatedUser } from '../../auth/auth.service';

export interface UpdateProfileRequest {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(`${API_BASE_URL}/api/users/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<AuthenticatedUser> {
    return this.http.put<AuthenticatedUser>(`${API_BASE_URL}/api/users/me`, request);
  }
}
