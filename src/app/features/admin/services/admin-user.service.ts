import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.config';
import { AdminUser, AdminUserDetail, AdminUserListResult, CreateAdminUserRequest, UserStatus } from '../models/admin-user.model';

export interface AdminUserFilters { search?: string; role?: 'Admin' | 'User'; status?: UserStatus; }

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/api/admin/users`;
  getUsers(page = 1, pageSize = 10, filters: AdminUserFilters = {}): Observable<AdminUserListResult> {
    const params: Record<string, string | number> = { page, pageSize };
    if (filters.search?.trim()) params['search'] = filters.search.trim();
    if (filters.role) params['role'] = filters.role;
    if (filters.status !== undefined) params['status'] = filters.status;
    return this.http.get<AdminUserListResult>(this.url, { params });
  }
  getUser(id: string): Observable<AdminUserDetail> { return this.http.get<AdminUserDetail>(`${this.url}/${id}`); }
  createUser(request: CreateAdminUserRequest): Observable<AdminUser> { return this.http.post<AdminUser>(this.url, request); }
  updateStatus(id: string, status: UserStatus): Observable<AdminUser> { return this.http.put<AdminUser>(`${this.url}/${id}/status`, { status }); }
  updateRole(id: string, role: 'Admin' | 'User'): Observable<AdminUser> { return this.http.put<AdminUser>(`${this.url}/${id}/role`, { role }); }
}
