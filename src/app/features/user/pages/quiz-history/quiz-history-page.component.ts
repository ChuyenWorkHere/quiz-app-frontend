import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideActivity, LucideArrowRight, LucideBookOpen, LucideCheckCircle2,
  LucideChevronLeft, LucideChevronRight, LucideCircleAlert, LucideClock3,
  LucideCloudOff, LucideFileCheck2, LucideHistory, LucideRefreshCw,
  LucideSearch, LucideTrophy
} from '@lucide/angular';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { QuizAttemptSkeletonComponent } from '../../../../shared/components/skeletons/quiz-attempt-skeleton/quiz-attempt-skeleton.component';
import { AuthService } from '../../../auth/auth.service';
import { QuizAttemptService } from '../../../home/services/quiz-attempt.service';
import { QuizAttempt } from '../../models/dashboard.model';

type HistoryStatus = 'all' | 'passed' | 'failed';

@Component({
  selector: 'app-quiz-history-page',
  imports: [
    FormsModule, RouterLink, DatePipe, DecimalPipe, QuizAttemptSkeletonComponent,
    LucideActivity, LucideArrowRight, LucideBookOpen, LucideCheckCircle2,
    LucideChevronLeft, LucideChevronRight, LucideCircleAlert, LucideClock3,
    LucideCloudOff, LucideFileCheck2, LucideHistory, LucideRefreshCw,
    LucideSearch, LucideTrophy
  ],
  templateUrl: './quiz-history-page.component.html',
  styleUrls: ['./quiz-history-page.component.css', './quiz-history-extra.component.css']
})
export class QuizHistoryPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly attemptService = inject(QuizAttemptService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  protected readonly attempts = signal<QuizAttempt[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly search = signal('');
  protected readonly status = signal<HistoryStatus>('all');
  protected readonly page = signal(1);
  protected readonly perPage = signal(8);
  protected readonly totalPages = signal(0);
  protected readonly totalItems = signal(0);
  protected readonly totalCompleted = signal(0);
  protected readonly averageScore = signal(0);
  protected readonly passedAttempts = signal(0);
  protected readonly totalDurationSeconds = signal(0);

  protected readonly passRate = computed(() => this.totalCompleted() === 0
    ? 0
    : this.passedAttempts() * 100 / this.totalCompleted());
  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const start = Math.max(1, Math.min(current - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  });
  protected readonly firstItem = computed(() => this.totalItems() === 0
    ? 0
    : (this.page() - 1) * this.perPage() + 1);
  protected readonly lastItem = computed(() => Math.min(this.page() * this.perPage(), this.totalItems()));

  ngOnInit(): void {
    this.searchChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadHistory(1));
    this.loadHistory();
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.searchChanges.next(value.trim());
  }

  protected onStatusChange(value: HistoryStatus): void {
    this.status.set(value);
    this.loadHistory(1);
  }

  protected onPageSizeChange(value: number): void {
    this.perPage.set(value);
    this.loadHistory(1);
  }

  protected loadHistory(page = this.page()): void {
    if (this.loading() && this.attempts().length > 0) return;
    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      this.errorMessage.set('Unable to identify the signed-in user.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const isPassed = this.status() === 'all' ? undefined : this.status() === 'passed';
    this.attemptService.getQuizAttemptsByUserId(
      userId, page, this.perPage(), this.search(), isPassed,
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.attempts.set(response.items);
        this.page.set(response.page);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.totalCompleted.set(response.totalCompleted);
        this.averageScore.set(response.averageScore);
        this.passedAttempts.set(response.passedAttempts);
        this.totalDurationSeconds.set(response.totalDurationSeconds);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to retrieve quiz history. Please try again.');
      },
    });
  }

  protected resetFilters(): void {
    this.search.set('');
    this.status.set('all');
    this.loadHistory(1);
  }

  protected formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
}
