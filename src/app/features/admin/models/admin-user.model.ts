import { PagedResult } from '../../../core/models/paged-result.model';

export enum UserStatus { Locked = 0, Active = 1 }

export interface AdminUser {
  id: string; fullName: string; username: string; email: string; phone: string | null;
  dateOfBirth: string | null; avatar: string | null; status: UserStatus;
  createdAt: string; updatedAt: string; roles: string[]; attempts: number; averageScore: number;
}

export interface AdminUserAttempt { attemptId: number; quizId: number; quizTitle: string; score: number; isPassed: boolean; submittedAt: string; }
export interface AdminUserDetail extends AdminUser { recentAttempts: AdminUserAttempt[]; }
export interface AdminUserListResult extends PagedResult<AdminUser> { totalUsers: number; activeUsers: number; lockedUsers: number; adminUsers: number; }
export interface CreateAdminUserRequest { fullName: string; username: string; email: string; password: string; role: 'Admin' | 'User'; }
