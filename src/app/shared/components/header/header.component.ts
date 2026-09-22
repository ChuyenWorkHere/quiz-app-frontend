import { LucideMessageSquareCheck, LucideMenu, LucideX } from '@lucide/angular';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LucideMessageSquareCheck, LucideMenu, LucideX],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly registration = input(false);
  protected readonly menuOpen = signal(false);
  protected readonly authService = inject(AuthService);

  protected readonly session = this.authService.getSession();
  protected readonly user = this.session?.user;
}
