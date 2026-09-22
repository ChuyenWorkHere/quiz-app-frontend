import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideBadgeCheck, LucideBookOpen, LucideChevronDown, LucideCircleCheck, LucideClock3, LucideHouse, LucideInfo, LucideLightbulb, LucideLifeBuoy, LucideMailCheck, LucideSchool, LucideSend, LucideShieldCheck } from '@lucide/angular';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent, LucideHouse, LucideBookOpen, LucideBadgeCheck, LucideCircleCheck, LucideInfo, LucideLightbulb, LucideShieldCheck, LucideSend, LucideArrowRight, LucideClock3, LucideMailCheck, LucideSchool, LucideLifeBuoy, LucideChevronDown],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css'
})
export class ContactPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly sent = signal(false);
  protected readonly submitted = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    category: ['quiz-content', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(1000)]]
  });
  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sent.set(true);
  }
  protected sendAnother(): void {
    this.sent.set(false);
    this.submitted.set(false);
    this.form.reset({ fullName: '', email: '', category: 'quiz-content', message: '' });
  }
}
