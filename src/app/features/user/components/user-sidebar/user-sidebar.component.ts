import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideArrowRight, LucideCircleHelp, LucideHistory, LucideLayoutDashboard, LucideMessageSquareCheck, LucideUserRound, LucideX, LucideBookOpenCheck } from '@lucide/angular';

@Component({
  selector: 'app-user-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideArrowRight, LucideCircleHelp, LucideHistory, LucideLayoutDashboard, LucideMessageSquareCheck, LucideUserRound, LucideX, LucideBookOpenCheck],
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.css'
})
export class UserSidebarComponent {
  readonly open = input(false);
  readonly closeMenu = output<void>();
}
