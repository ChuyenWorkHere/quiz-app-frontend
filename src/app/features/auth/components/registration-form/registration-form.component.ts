import { LucideCheck } from '@lucide/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registration-form',
  imports: [ReactiveFormsModule, RouterLink, LucideCheck],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.css'
})
export class RegistrationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly isSuccess = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    dateOfBirth: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    terms: [true, Validators.requiredTrue],
  }, { validators: passwordsMatch });

  protected submit(): void {
    this.statusMessage.set('');
    this.isSuccess.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const { confirmPassword, terms, ...details } = this.form.getRawValue();
    this.authService.register(details).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        const destination = '/user/dashboard';
        void this.router.navigateByUrl(destination);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.isSuccess.set(false);
        this.statusMessage.set(this.getRegistrationError(error));
      }
    });
  }

  private getRegistrationError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the server.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return error.error?.detail
      ?? error.error?.message
      ?? error.error?.title
      ?? 'Registration failed. Please try again.';
  }
}
