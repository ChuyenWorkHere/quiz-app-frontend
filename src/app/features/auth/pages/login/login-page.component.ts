import { LucideShieldCheck } from '@lucide/angular';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-login-page',
  imports: [HeaderComponent, LoginFormComponent, FooterComponent, LucideShieldCheck],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent { }
