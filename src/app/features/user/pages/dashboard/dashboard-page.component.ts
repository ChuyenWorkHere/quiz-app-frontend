import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck, LucideCircleCheckBig, LucideCompass, LucideHistory, LucideLightbulb, LucidePlayCircle, LucideSearch, LucideSparkles, LucideTrendingUp, LucideTrophy } from '@lucide/angular';
import { QuizAttempt } from '../../models/dashboard.model';
import { AuthService } from '../../../auth/auth.service';
import { QuizAttemptSkeletonComponent } from '../../../../shared/components/skeletons/quiz-attempt-skeleton/quiz-attempt-skeleton.component';
import { QuizCardSkeletonComponent } from '../../../../shared/components/skeletons/quiz-card-skeleton/quiz-card-skeleton.component';
import { QuizCardComponent } from '../../../../shared/components/quiz-card/quiz-card.component';
import { QuizService } from '../../../home/services/quiz.service';
import { Quiz } from '../../../home/models/quiz.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuizAttemptService } from '../../../home/services/quiz-attempt.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, DatePipe, DecimalPipe, QuizCardComponent, QuizCardSkeletonComponent, QuizAttemptSkeletonComponent, LucideArrowRight, LucideCheck, LucideCircleCheckBig, LucideCompass, LucideHistory, LucideLightbulb, LucidePlayCircle, LucideSearch, LucideSparkles, LucideTrendingUp, LucideTrophy],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {
  
  
  private readonly destroyRef = inject(DestroyRef);
  protected readonly search = signal('');
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.currentUser;

  protected readonly quizzesLoading = signal(false);
  protected readonly quizzesError = signal(false);
  private readonly quizService = inject(QuizService);
  
  protected readonly quizzes = signal<Quiz[]>([]);
  protected readonly quizPageSize = 3;
  protected readonly quizPage = signal(1);
  protected readonly quizTotalPages = signal(0);
  protected readonly quizTotalItems = signal(0);

  protected readonly attemptsLoading = signal(false);
  protected readonly attemptsError = signal(false);
  private readonly quizAttemptService = inject(QuizAttemptService);

  protected readonly attempts = signal<QuizAttempt[]>([]);
  protected readonly attemptPageSize = 6;
  protected readonly attemptPage = signal(1);
  protected readonly attemptTotalPages = signal(0);
  protected readonly attemptTotalItems = signal(0);
  protected readonly showEmptyAttempts = signal(false);
  protected readonly completedQuizzes = signal(0);
  protected readonly averageScore = signal(0);
  protected readonly bestScore = signal(0);
  protected readonly bestQuizTitle = signal('No completed quiz yet');
  protected readonly averageScorePercent = computed(() => Math.min(100, Math.max(0, this.averageScore())));
  
  ngOnInit(): void {
    this.loadQuizzes();
    this.getQuizAttempts();
  }

  protected loadQuizzes(page = this.quizPage()): void {
    if (this.quizzesLoading()) return;
    this.quizPage.set(page);
    this.quizzesLoading.set(true);
    this.quizService.getActiveQuizzes(page, this.quizPageSize)
    .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.quizzes.set(response.items);
        this.quizPage.set(response.page);
        this.quizTotalPages.set(response.totalPages);
        this.quizTotalItems.set(response.totalItems);
        this.quizzesLoading.set(false);
        this.quizzesError.set(false);
      },
      error: () => {
        this.quizzesError.set(true);
        this.quizzesLoading.set(false);
      },
    });
  }

  protected getQuizAttempts(page = this.attemptPage()): void {
    if (this.attemptsLoading()) return;
    this.attemptPage.set(page);
    this.attemptsLoading.set(true);
    const userId = this.user()?.id;
    if (!userId) {
      this.attemptsError.set(true);
      this.attemptsLoading.set(false);
      return;
    }
    this.quizAttemptService.getQuizAttemptsByUserId(userId, page, this.attemptPageSize)
    .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.attempts.set(response.items);
        this.attemptPage.set(response.page);
        this.attemptTotalPages.set(response.totalPages);
        this.attemptTotalItems.set(response.totalItems);
        this.completedQuizzes.set(response.totalCompleted);
        this.averageScore.set(response.averageScore);
        this.bestScore.set(response.bestScore);
        this.bestQuizTitle.set(response.bestQuizTitle || 'No completed quiz yet');
        this.showEmptyAttempts.set(response.items.length === 0 && response.totalItems === 0);
        this.attemptsLoading.set(false);
        this.attemptsError.set(false);
      },
      error: () => {
        this.attemptsError.set(true);
        this.attemptsLoading.set(false);
      },
    });
  }
}
