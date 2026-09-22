import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideBadge, LucideCalendarDays, LucideCheck, LucideChevronRight,
  LucideCircleAlert, LucideCircleCheckBig, LucideEdit3, LucideEye, LucideRefreshCw,
  LucideSave, LucideTrendingUp, LucideX
} from '@lucide/angular';
import { AuthService, AuthenticatedUser } from '../../../auth/auth.service';
import { UpdateProfileRequest, UserProfileService } from '../../services/user-profile.service';

interface ProfileForm {
  fullName: string;
  email: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
}

@Component({
  selector: 'app-user-profile-page',
  imports: [
    DatePipe, FormsModule, RouterLink, LucideBadge, LucideCalendarDays,
    LucideCheck, LucideChevronRight, LucideCircleAlert,
    LucideCircleCheckBig, LucideEdit3, LucideEye, LucideRefreshCw,
    LucideSave, LucideTrendingUp, LucideX
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.css', './user-profile-extra.component.css']
})
export class UserProfilePageComponent implements OnInit {
  private readonly profileService = inject(UserProfileService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly editMode = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly toastVisible = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly createdAt = signal('');
  protected readonly roles = signal<string[]>([]);

  protected profile: ProfileForm = this.emptyProfile();
  private savedProfile: ProfileForm = this.emptyProfile();

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.profileService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          this.applyUser(user);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Unable to load your profile. Please try again.');
        },
      });
  }

  protected enterEditMode(): void {
    this.editMode.set(true);
    this.toastVisible.set(false);
    this.errorMessage.set('');
  }

  protected cancelEdit(): void {
    this.profile = { ...this.savedProfile };
    this.editMode.set(false);
    this.errorMessage.set('');
  }

  protected saveProfile(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const request: UpdateProfileRequest = {
      fullName: this.profile.fullName.trim(),
      phone: this.profile.phone.trim() || null,
      dateOfBirth: this.profile.dateOfBirth || null,
      avatar: this.profile.avatar || null,
    };

    this.profileService.updateProfile(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          this.applyUser(user);
          this.authService.updateCurrentUser(user);
          this.saving.set(false);
          this.editMode.set(false);
          this.toastVisible.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.detail ?? 'Unable to update your profile.');
        },
      });
  }

  protected initials(): string {
    return this.profile.fullName.split(/\s+/).filter(Boolean).slice(-2)
      .map(part => part[0]?.toUpperCase()).join('') || 'U';
  }

  private applyUser(user: AuthenticatedUser): void {
    const profile = {
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      username: user.username ?? '',
      phone: user.phone ?? '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      avatar: user.avatar ?? '',
    };
    this.profile = { ...profile };
    this.savedProfile = { ...profile };
    this.createdAt.set(user.createdAt);
    this.roles.set(user.roles ?? []);
  }

  private emptyProfile(): ProfileForm {
    return { fullName: '', email: '', username: '', phone: '', dateOfBirth: '', avatar: '' };
  }
}
