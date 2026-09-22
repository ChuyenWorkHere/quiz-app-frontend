import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideGraduationCap, LucideInfo, LucidePower, LucideRefreshCw, LucideShieldCheck, LucideUserRound, LucideX } from '@lucide/angular';
import { AdminUserDetail, UserStatus } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-user-detail-page',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, LucideArrowLeft, LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideGraduationCap, LucideInfo, LucidePower, LucideRefreshCw, LucideShieldCheck, LucideUserRound, LucideX],
  templateUrl: './admin-user-detail-page.component.html',
  styleUrl: './admin-user-detail-page.component.css',
})
export class AdminUserDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AdminUserService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly UserStatus = UserStatus;
  protected readonly userId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly user = signal<AdminUserDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly modal = signal<'status' | 'role' | null>(null);
  protected readonly toast = signal('');
  protected readonly targetRole = signal<'Admin' | 'User'>('User');

  ngOnInit(): void { this.loadUser(); }
  protected loadUser(): void {
    if (!this.userId) { this.loading.set(false); this.errorMessage.set('Invalid user identifier.'); return; }
    this.loading.set(true); this.errorMessage.set('');
    this.service.getUser(this.userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.user.set(user); this.targetRole.set(user.roles.includes('Admin') ? 'Admin' : 'User'); this.loading.set(false); },
      error: () => { this.loading.set(false); this.errorMessage.set('Unable to load user details. Please try again.'); },
    });
  }
  protected openRole(): void { const user = this.user(); if (user) this.targetRole.set(user.roles.includes('Admin') ? 'Admin' : 'User'); this.modal.set('role'); }
  protected roleName(): string { return this.user()?.roles.includes('Admin') ? 'Administrator' : 'User'; }
  protected applyStatus(): void {
    const user = this.user(); if (!user) return;
    const status = user.status === UserStatus.Active ? UserStatus.Locked : UserStatus.Active;
    this.saving.set(true); this.errorMessage.set('');
    this.service.updateStatus(user.id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => { this.user.update(current => current ? { ...current, ...updated } : current); this.saving.set(false); this.modal.set(null); this.toast.set(`Account is now ${status === UserStatus.Active ? 'active' : 'locked'}.`); },
      error: (error: HttpErrorResponse) => { this.saving.set(false); this.modal.set(null); this.errorMessage.set(error.error?.detail ?? 'Unable to change account status.'); },
    });
  }
  protected applyRole(): void {
    const user = this.user(); if (!user) return;
    this.saving.set(true); this.errorMessage.set('');
    this.service.updateRole(user.id, this.targetRole()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => { this.user.update(current => current ? { ...current, ...updated } : current); this.saving.set(false); this.modal.set(null); this.toast.set('The user role was updated.'); },
      error: (error: HttpErrorResponse) => { this.saving.set(false); this.modal.set(null); this.errorMessage.set(error.error?.detail ?? 'Unable to change the user role.'); },
    });
  }
}
