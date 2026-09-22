import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideEye, LucideInfo, LucideLockKeyhole, LucidePlus, LucideRefreshCw, LucideSearch, LucideShieldCheck, LucideUserPlus, LucideUsersRound, LucideX } from '@lucide/angular';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminUser, CreateAdminUserRequest, UserStatus } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-user-management-page',
  imports: [FormsModule, RouterLink, DecimalPipe, LucideChevronRight, LucideEye, LucideInfo, LucideLockKeyhole, LucidePlus, LucideRefreshCw, LucideSearch, LucideShieldCheck, LucideUserPlus, LucideUsersRound, LucideX],
  templateUrl: './admin-user-management-page.component.html',
  styleUrl: './admin-user-management-page.component.css',
})
export class AdminUserManagementPageComponent implements OnInit {
  private readonly service = inject(AdminUserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();
  protected readonly UserStatus = UserStatus;
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');
  protected readonly search = signal('');
  protected readonly role = signal<'all' | 'Admin' | 'User'>('all');
  protected readonly status = signal<'all' | UserStatus>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly createOpen = signal(false);
  protected readonly statusTarget = signal<AdminUser | null>(null);
  protected readonly saving = signal(false);
  protected readonly createForm = signal<CreateAdminUserRequest>({ fullName: '', username: '', email: '', password: '', role: 'User' });

  ngOnInit(): void {
    this.searchChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadUsers(1));
    this.loadUsers();
  }
  protected searchChanged(value: string): void { this.search.set(value); this.searchChanges.next(value); }
  protected filtersChanged(): void { this.loadUsers(1); }
  protected resetFilters(): void { this.search.set(''); this.role.set('all'); this.status.set('all'); this.loadUsers(1); }
  protected initials(user: AdminUser): string { return user.fullName.split(/\s+/).map(value => value[0]).join('').slice(0, 2).toUpperCase(); }
  protected roleName(user: AdminUser): string { return user.roles.includes('Admin') ? 'Administrator' : 'User'; }
  protected fromItem(): number { return this.totalItems() === 0 ? 0 : (this.page() - 1) * this.pageSize + 1; }
  protected toItem(): number { return Math.min(this.page() * this.pageSize, this.totalItems()); }

  protected loadUsers(page = this.page()): void {
    this.loading.set(true); this.errorMessage.set('');
    const role = this.role();
    const status = this.status();
    this.service.getUsers(page, this.pageSize, { search: this.search(), role: role === 'all' ? undefined : role, status: status === 'all' ? undefined : status })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: result => {
          this.users.set(result.items); this.page.set(result.page); this.totalItems.set(result.totalItems); this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.errorMessage.set('Unable to load users. Please try again.'); },
      });
  }
  protected updateCreateField<K extends keyof CreateAdminUserRequest>(field: K, value: CreateAdminUserRequest[K]): void { this.createForm.update(form => ({ ...form, [field]: value })); }
  protected createUser(): void {
    const form = this.createForm();
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || form.password.length < 6) { this.errorMessage.set('Enter a name, username, valid email and a password of at least 6 characters.'); return; }
    this.saving.set(true); this.errorMessage.set('');
    this.service.createUser(form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.saving.set(false); this.createOpen.set(false); this.createForm.set({ fullName: '', username: '', email: '', password: '', role: 'User' }); this.notice.set(`${user.fullName} was created successfully.`); this.loadUsers(1); },
      error: (error: HttpErrorResponse) => { this.saving.set(false); this.errorMessage.set(error.error?.detail ?? 'Unable to create the user.'); },
    });
  }
  protected toggleStatus(): void {
    const target = this.statusTarget(); if (!target) return;
    const status = target.status === UserStatus.Active ? UserStatus.Locked : UserStatus.Active;
    this.saving.set(true); this.errorMessage.set('');
    this.service.updateStatus(target.id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.saving.set(false); this.statusTarget.set(null); this.notice.set(`${user.fullName} is now ${status === UserStatus.Active ? 'active' : 'locked'}.`); this.loadUsers(); },
      error: (error: HttpErrorResponse) => { this.saving.set(false); this.statusTarget.set(null); this.errorMessage.set(error.error?.detail ?? 'Unable to change account status.'); },
    });
  }
}
