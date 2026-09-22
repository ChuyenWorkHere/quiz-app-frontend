import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideArrowLeft, LucideCheck, LucideCheckCircle2, LucideChevronRight,
  LucideCircleAlert, LucideCircleX, LucideClock3, LucideFileCheck2,
  LucideHistory, LucideInfo, LucideListChecks, LucideMedal, LucideRefreshCw
} from '@lucide/angular';
import { QuizAttemptService } from '../../../home/services/quiz-attempt.service';
import { QuizAttemptResult } from '../../models/quiz-attempt.model';

@Component({
  selector: 'app-quiz-results-page',
  imports: [
    RouterLink, DatePipe, DecimalPipe, LucideArrowLeft, LucideCheck, LucideCheckCircle2, LucideChevronRight,
    LucideCircleAlert, LucideCircleX, LucideClock3, LucideFileCheck2, LucideHistory,
    LucideInfo, LucideListChecks, LucideMedal, LucideRefreshCw
  ],
  templateUrl: './quiz-results-page.component.html',
  styleUrls: ['./quiz-results-page.component.css', './quiz-results-state.component.css']
})
export class QuizResultsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly attemptService = inject(QuizAttemptService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly result = signal<QuizAttemptResult | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly selectedQuestion = signal<number | null>(null);
  protected readonly incorrect = computed(() => {
    const result = this.result();
    return result ? result.totalQuestions - result.correctAnswers : 0;
  });
  protected readonly ringOffset = computed(() =>
    427.25 * (1 - Math.min(100, Math.max(0, this.result()?.score ?? 0)) / 100));

  ngOnInit(): void {
    this.loadResult();
  }

  protected loadResult(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    const attemptId = Number(this.route.snapshot.queryParamMap.get('attemptId'));
    if (!Number.isInteger(quizId) || quizId <= 0 || !Number.isInteger(attemptId) || attemptId <= 0) {
      this.loading.set(false);
      this.errorMessage.set('The result link is invalid. Open the result from your quiz history.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.attemptService.getAttemptResult(attemptId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.loading.set(false);
          if (result.quizId !== quizId) {
            this.errorMessage.set('This result does not belong to the selected quiz.');
            return;
          }
          this.result.set(result);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.detail ?? 'Unable to load this quiz result.');
        },
      });
  }

  protected isMissed(questionNumber: number): boolean {
    return this.result()?.questionResults[questionNumber - 1]?.isCorrect === false;
  }

  protected get formattedDuration(): string {
    const duration = this.result()?.durationSeconds ?? 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
}
