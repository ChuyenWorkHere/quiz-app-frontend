import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideArrowRight, LucideCalendarCheck, LucideChevronRight, LucideCircleAlert, LucideClock3, LucideInfo, LucideListChecks, LucideMedal, LucideRefreshCw } from '@lucide/angular';
import { Quiz } from '../../../home/models/quiz.model';
import { QuizService } from '../../../home/services/quiz.service';
import { QuizAttemptService } from '../../../home/services/quiz-attempt.service';
@Component({ 
  selector: 'app-user-quiz-detail-page', 
  imports: [RouterLink, LucideArrowLeft, LucideArrowRight, LucideCalendarCheck, LucideChevronRight, LucideCircleAlert, LucideClock3, LucideInfo, LucideListChecks, LucideMedal, LucideRefreshCw], 
  templateUrl: './user-quiz-detail-page.component.html', 
  styleUrl: './user-quiz-detail-page.component.css' 
})
export class UserQuizDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);
  private readonly attemptService = inject(QuizAttemptService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly quiz = signal<Quiz | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly startConfirmation = signal(false);
  protected readonly starting = signal(false);
  protected readonly startError = signal('');

  ngOnInit(): void {
    this.loadQuiz();
  }

  protected loadQuiz(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid quiz identifier.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.quizService.getActiveQuizById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: quiz => {
          this.quiz.set(quiz);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.quiz.set(null);
          this.loading.set(false);
          this.errorMessage.set(error.status === 404
            ? 'This quiz is unavailable or has been deactivated.'
            : 'Unable to load quiz details. Please try again.');
        },
      });
  }

  protected startQuiz(): void {
    const quiz = this.quiz();
    if (!quiz || this.starting()) return;

    this.starting.set(true);
    this.startError.set('');
    this.attemptService.startAttempt(quiz.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          this.starting.set(false);
          this.startConfirmation.set(false);
          void this.router.navigate(['/user/quizzes', quiz.id, 'take'], {
            queryParams: { attemptId: session.attemptId },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.starting.set(false);
          this.startError.set(error.error?.detail ?? 'Unable to start this quiz. Please try again.');
        },
      });
  }
}
