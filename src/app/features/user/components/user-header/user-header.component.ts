import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideBell, LucideChevronDown, LucideLogOut, LucideMenu, LucideSearch, LucideSettings, LucideUserRound } from '@lucide/angular';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-user-header',
  imports: [RouterLink, LucideBell, LucideChevronDown, LucideLogOut, LucideMenu, LucideSearch, LucideSettings, LucideUserRound],
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.css'
})
export class UserHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly user = this.authService.currentUser;
  readonly openNavigation = output<void>();
  protected readonly profileOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly search = signal('');
  protected readonly failedAvatarUrl = signal('');

  protected initials(): string {
    return (this.user()?.fullName ?? 'User').split(/\s+/).filter(Boolean).slice(-2)
      .map(part => part[0]?.toUpperCase()).join('') || 'U';
  }

  protected closePopovers(): void {
    this.profileOpen.set(false);
    this.notificationsOpen.set(false);
  }

  protected signOut(): void {
    this.authService.signOut();
    this.closePopovers();
    void this.router.navigate(['/login']);
  }
}
