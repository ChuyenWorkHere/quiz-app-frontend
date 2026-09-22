import { LucideMessageSquareCheck, LucideContact, LucideLockKeyhole, LucideDynamicIcon, LucideLogIn, LucideEye, LucideEyeOff } from '@lucide/angular';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink, LucideMessageSquareCheck, LucideContact, LucideLockKeyhole, LucideDynamicIcon, LucideLogIn],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent {
  protected readonly eyeIcon = LucideEye;
  protected readonly eyeOffIcon = LucideEyeOff;
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  
  protected readonly statusMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  protected get email() { return this.loginForm.controls.email; }
  protected get password() { return this.loginForm.controls.password; }

  protected signIn(): void {
    if (this.isSubmitting()) return;
    this.statusMessage.set('');
    this.errorMessage.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.authService.signIn(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
          ? returnUrl
          : '/user/dashboard';
        void this.router.navigateByUrl(destination);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.detail ?? error.error?.title ?? 'Unable to sign in. Please check your credentials and try again.',
        );
      },
    });
  }
}
