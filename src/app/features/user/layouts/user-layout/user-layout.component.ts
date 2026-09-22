import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserHeaderComponent } from '../../components/user-header/user-header.component';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, UserHeaderComponent, UserSidebarComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {
  protected readonly sidebarOpen = signal(false);
}
