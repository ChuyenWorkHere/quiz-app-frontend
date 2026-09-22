import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideCircleHelp, LucideDatabase, LucideFileText, LucideLayoutDashboard, LucideMessageSquareCheck, LucideSettings, LucideUsersRound, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideCircleHelp, LucideDatabase, LucideFileText, LucideLayoutDashboard, LucideMessageSquareCheck, LucideSettings, LucideUsersRound, LucideX],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {
  readonly open = input(false);
  readonly closeMenu = output<void>();
}
