import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideArrowLeft, LucideArrowRight, LucideCheck, LucideCheckCircle2,
  LucideChevronDown, LucideChevronRight, LucideCircleAlert, LucideCircleX,
  LucideClock3, LucideExpand, LucideGauge, LucideMedal, LucideRefreshCw,
  LucideSearch
} from '@lucide/angular';
import { QuizAttemptService } from '../../../home/services/quiz-attempt.service';
import { AttemptQuestionReview, AttemptQuestionType, QuizAttemptReview } from '../../models/quiz-attempt.model';

type ReviewFilter = 'all' | 'correct' | 'incorrect' | 'unanswered';

@Component({
  selector: 'app-quiz-attempt-review-page',
  imports: [
    FormsModule, RouterLink, DecimalPipe, LucideArrowLeft, LucideArrowRight,
    LucideCheck, LucideCheckCircle2, LucideChevronDown, LucideChevronRight,
    LucideCircleAlert, LucideCircleX, LucideClock3, LucideExpand, LucideGauge,
    LucideMedal, LucideRefreshCw, LucideSearch
  ],
  templateUrl: './quiz-attempt-review-page.component.html',
  styleUrls: ['./quiz-attempt-review-page.component.css', './quiz-attempt-review-extra.component.css']
})
export class QuizAttemptReviewPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly attemptService = inject(QuizAttemptService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly review = signal<QuizAttemptReview | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly filter = signal<ReviewFilter>('all');
  protected readonly search = signal('');
  protected readonly expanded = signal(false);
  protected readonly showAll = signal(false);

  protected readonly incorrectCount = computed(() => {
    const review = this.review();
    return review ? review.totalQuestions - review.correctAnswers : 0;
  });
  protected readonly unansweredCount = computed(() =>
    this.review()?.questions.filter(question => !question.isAnswered).length ?? 0);
  protected readonly visibleQuestions = computed(() => {
    const query = this.search().trim().toLowerCase();
    const questions = this.review()?.questions ?? [];
    const filtered = questions.filter(question => {
      const matchesFilter = this.filter() === 'all'
        || (this.filter() === 'correct' && question.isCorrect)
        || (this.filter() === 'incorrect' && !question.isCorrect)
        || (this.filter() === 'unanswered' && !question.isAnswered);
      return matchesFilter && (!query || `${question.content} ${this.questionTypeLabel(question.questionType)}`.toLowerCase().includes(query));
    });
    return this.showAll() ? filtered : filtered.slice(0, 5);
  });

  ngOnInit(): void {
    this.loadReview();
  }

  protected loadReview(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    const attemptId = Number(this.route.snapshot.queryParamMap.get('attemptId'));
    if (!Number.isInteger(quizId) || quizId <= 0 || !Number.isInteger(attemptId) || attemptId <= 0) {
      this.loading.set(false);
      this.errorMessage.set('The review link is invalid. Open it again from Quiz History.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.attemptService.getAttemptReview(attemptId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: review => {
          this.loading.set(false);
          if (review.quizId !== quizId) {
            this.errorMessage.set('This attempt does not belong to the selected quiz.');
            return;
          }
          this.review.set(review);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.detail ?? 'Unable to load the submitted answers.');
        },
      });
  }

  protected questionTypeLabel(type: AttemptQuestionType): string {
    switch (type) {
      case AttemptQuestionType.MultipleSelect: return 'Multiple Select';
      case AttemptQuestionType.TrueFalse: return 'True / False';
      default: return 'Single Choice';
    }
  }

  protected selectedAnswer(question: AttemptQuestionReview): string {
    const values = question.answers.filter(answer => answer.isSelected).map(answer => answer.text);
    return values.length ? values.join(', ') : 'No answer submitted';
  }

  protected correctAnswer(question: AttemptQuestionReview): string {
    return question.answers.filter(answer => answer.isCorrect).map(answer => answer.text).join(', ');
  }

  protected formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
