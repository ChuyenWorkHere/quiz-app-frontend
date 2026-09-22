import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft, LucideArrowRight, LucideBookmark, LucideCheck, LucideChevronRight,
  LucideCircleAlert, LucideClock3, LucideEraser, LucideFlag, LucideHouse,
  LucideInfo, LucideLogOut, LucideRefreshCw, LucideSend, LucideX
} from '@lucide/angular';
import { QuizAttemptService } from '../../../home/services/quiz-attempt.service';
import { AttemptQuestionType, QuizAttemptSession } from '../../models/quiz-attempt.model';

type Dialog = 'cancel' | 'submit' | null;

@Component({
  selector: 'app-quiz-taking-page',
  imports: [
    RouterLink, LucideArrowLeft, LucideArrowRight, LucideBookmark, LucideCheck,
    LucideChevronRight, LucideCircleAlert, LucideClock3, LucideEraser, LucideFlag,
    LucideHouse, LucideInfo, LucideLogOut, LucideRefreshCw, LucideSend, LucideX
  ],
  templateUrl: './quiz-taking-page.component.html',
  styleUrl: './quiz-taking-page.component.css'
})
export class QuizTakingPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attemptService = inject(QuizAttemptService);
  private readonly destroyRef = inject(DestroyRef);
  private timerId: number | null = null;
  private autoSubmitted = false;

  protected readonly QuestionType = AttemptQuestionType;
  protected readonly session = signal<QuizAttemptSession | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly currentIndex = signal(0);
  protected readonly selectedAnswers = signal<Record<number, number[]>>({});
  protected readonly flagged = signal(new Set<number>());
  protected readonly secondsLeft = signal(0);
  protected readonly dialog = signal<Dialog>(null);

  protected readonly currentQuestion = computed(() =>
    this.session()?.questions[this.currentIndex()] ?? null);
  protected readonly answeredCount = computed(() =>
    Object.values(this.selectedAnswers()).filter(answerIds => answerIds.length > 0).length);
  protected readonly unanswered = computed(() =>
    (this.session()?.questions ?? [])
      .map((question, index) => ({ question, number: index + 1 }))
      .filter(item => !(this.selectedAnswers()[item.question.id]?.length))
      .map(item => item.number));

  ngOnInit(): void {
    this.loadSession();
  }

  protected get formattedTime(): string {
    const minutes = Math.floor(this.secondsLeft() / 60);
    const seconds = this.secondsLeft() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  protected loadSession(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    const attemptId = Number(this.route.snapshot.queryParamMap.get('attemptId'));
    if (!Number.isInteger(quizId) || quizId <= 0 || !Number.isInteger(attemptId) || attemptId <= 0) {
      this.loading.set(false);
      this.errorMessage.set('The quiz session link is invalid. Start the quiz again from its detail page.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.attemptService.getAttemptSession(attemptId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          if (session.quizId !== quizId) {
            this.loading.set(false);
            this.errorMessage.set('This attempt does not belong to the selected quiz.');
            return;
          }
          this.session.set(session);
          this.loading.set(false);
          this.updateTimeRemaining();
          this.startTimer();
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.detail ?? 'Unable to load this quiz attempt.');
        },
      });
  }

  protected goTo(questionNumber: number): void {
    const total = this.session()?.questions.length ?? 0;
    if (questionNumber < 1 || questionNumber > total) return;
    this.currentIndex.set(questionNumber - 1);
  }

  protected isSelected(answerId: number): boolean {
    const question = this.currentQuestion();
    return !!question && (this.selectedAnswers()[question.id] ?? []).includes(answerId);
  }

  protected toggleOption(answerId: number): void {
    const question = this.currentQuestion();
    if (!question || this.submitting()) return;

    const current = this.selectedAnswers()[question.id] ?? [];
    const answerIds = question.questionType === AttemptQuestionType.MultipleSelect
      ? current.includes(answerId) ? current.filter(id => id !== answerId) : [...current, answerId]
      : [answerId];
    this.selectedAnswers.update(answers => ({ ...answers, [question.id]: answerIds }));
  }

  protected clearAnswer(): void {
    const question = this.currentQuestion();
    if (!question) return;
    this.selectedAnswers.update(answers => ({ ...answers, [question.id]: [] }));
  }

  protected toggleFlag(): void {
    const question = this.currentQuestion();
    if (!question) return;
    const next = new Set(this.flagged());
    next.has(question.id) ? next.delete(question.id) : next.add(question.id);
    this.flagged.set(next);
  }

  protected isAnswered(questionId: number): boolean {
    return !!this.selectedAnswers()[questionId]?.length;
  }

  protected closeDialog(): void {
    if (!this.submitting()) this.dialog.set(null);
  }

  protected exitQuiz(): void {
    const quizId = this.session()?.quizId;
    if (quizId) void this.router.navigate(['/user/quizzes', quizId]);
  }

  protected submitQuiz(automatic = false): void {
    const session = this.session();
    if (!session || this.submitting()) return;

    this.dialog.set(null);
    this.submitting.set(true);
    this.submitError.set('');
    const answers = session.questions
      .map(question => ({ questionId: question.id, answerIds: this.selectedAnswers()[question.id] ?? [] }))
      .filter(answer => answer.answerIds.length > 0);

    this.attemptService.submitAttempt(session.attemptId, { answers })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.stopTimer();
          void this.router.navigate(['/user/quizzes', result.quizId, 'results'], {
            queryParams: { attemptId: result.attemptId },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.submitError.set(error.error?.detail ?? (automatic
            ? 'Time is up, but the quiz could not be submitted. Please try again.'
            : 'Unable to submit the quiz. Please try again.'));
        },
      });
  }

  protected questionTypeLabel(): string {
    switch (this.currentQuestion()?.questionType) {
      case AttemptQuestionType.MultipleSelect: return 'MULTIPLE SELECT';
      case AttemptQuestionType.TrueFalse: return 'TRUE OR FALSE';
      default: return 'SINGLE CHOICE';
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerId = window.setInterval(() => this.updateTimeRemaining(), 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) window.clearInterval(this.timerId);
    this.timerId = null;
  }

  private updateTimeRemaining(): void {
    const expiresAt = this.session()?.expiresAt;
    if (!expiresAt) return;
    const expiresAtMilliseconds = this.parseServerUtc(expiresAt);
    if (!Number.isFinite(expiresAtMilliseconds)) {
      this.stopTimer();
      this.errorMessage.set('The quiz expiration time returned by the server is invalid.');
      return;
    }
    const remaining = Math.max(0, Math.ceil((expiresAtMilliseconds - Date.now()) / 1000));
    this.secondsLeft.set(remaining);
    if (remaining === 0 && !this.autoSubmitted) {
      this.autoSubmitted = true;
      this.stopTimer();
      this.submitQuiz(true);
    }
  }

  private parseServerUtc(value: string): number {
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
    return Date.parse(hasTimezone ? value : `${value}Z`);
  }
}
