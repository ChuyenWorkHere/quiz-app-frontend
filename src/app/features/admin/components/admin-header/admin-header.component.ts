import { Component, inject, output, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LucideBell, LucideChevronRight, LucideLogOut, LucideMenu, LucideSearch, LucideUserRound } from '@lucide/angular';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-admin-header',
  imports: [LucideBell, LucideChevronRight, LucideLogOut, LucideMenu, LucideSearch, LucideUserRound],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly user = this.authService.currentUser;
  protected readonly accountOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly search = signal('');
  protected readonly failedAvatarUrl = signal('');
  readonly openNavigation = output<void>();

  protected pageTitle = 'Dashboard';

  protected initials(): string {
    return (this.user()?.fullName ?? 'Admin').split(/\s+/).filter(Boolean).slice(-2)
      .map(part => part[0]?.toUpperCase()).join('') || 'A';
  }

  constructor() {
    this.updatePageTitle(this.router.url);
    this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(event => this.updatePageTitle(event.urlAfterRedirects));
  }

  protected closePopovers(): void { 
    this.accountOpen.set(false); 
    this.notificationsOpen.set(false); 
  }
  protected signOut(): void { 
    this.authService.signOut(); 
    void this.router.navigate(['/login']); 
  }

  private updatePageTitle(url: string): void {
    this.pageTitle = /\/admin\/users\/[^/]+$/.test(url)
      ? 'User Details'
      : url.includes('/admin/users')
      ? 'User Management'
      : url.includes('/admin/questions/new')
      ? 'Create Question'
      : url.includes('/admin/questions/') && url.includes('/edit')
      ? 'Edit Question'
      : /\/admin\/questions\/[^/]+$/.test(url)
      ? 'Question Details'
      : url.includes('/admin/questions')
      ? 'Question Bank'
      : url.includes('/admin/quizzes/new')
      ? 'Create Quiz'
      : url.includes('/edit')
        ? 'Edit Quiz'
        : url.includes('/admin/quizzes')
          ? 'Quiz Management'
          : 'Dashboard';
  }
}

