import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAlertTriangle, LucideArrowRight, LucideBadge, LucideBolt, LucideCalendarDays, LucideCheckCircle2, LucideDatabase, LucideDownload, LucideExternalLink, LucideFilePlus2, LucideFileText, LucideLibraryBig, LucideLockKeyhole, LucidePencil, LucidePlay, LucideRefreshCw, LucideShieldCheck, LucideTrendingUp, LucideUserPlus, LucideUsersRound } from '@lucide/angular';
import { Quiz } from '../../../home/models/quiz.model';
import { QuizService } from '../../../home/services/quiz.service';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [DatePipe, RouterLink, LucideArrowRight, LucideBadge, LucideBolt, LucideCheckCircle2, LucideDatabase, LucideDownload, LucideExternalLink, LucideFilePlus2, LucideFileText, LucideLibraryBig, LucideLockKeyhole, LucidePencil, LucidePlay, LucideTrendingUp, LucideUserPlus, LucideAlertTriangle, LucideRefreshCw],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css'
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly userService = inject(AdminUserService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly quizzes = signal<Quiz[]>([]);
  protected readonly totalQuizzes = signal(0);
  protected readonly totalUsers = signal(0);
  protected readonly activeUsers = signal(0);
  protected readonly adminUsers = signal(0);
  protected readonly usersLoading = signal(true);
  protected readonly usersLoadError = signal(false);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly activeQuizzes = computed(() => this.quizzes().filter(quiz => quiz.isActive).length);
  protected readonly inactiveQuizzes = computed(() => this.quizzes().filter(quiz => !quiz.isActive).length);
  protected readonly totalQuestions = computed(() => this.quizzes().reduce((total, quiz) => total + quiz.numberOfQuestions, 0));
  protected readonly recentQuizzes = computed(() => [...this.quizzes()]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 5));

  ngOnInit(): void { this.loadQuizzes(); this.loadUsers(); }

  protected loadUsers(): void {
    this.usersLoading.set(true);
    this.usersLoadError.set(false);
    this.userService.getUsers(1, 1).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.totalUsers.set(response.totalUsers);
        this.activeUsers.set(response.activeUsers);
        this.adminUsers.set(response.adminUsers);
        this.usersLoading.set(false);
      },
      error: () => { this.usersLoading.set(false); this.usersLoadError.set(true); },
    });
  }

  protected loadQuizzes(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.quizService.getAllQuizzes(1, 1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.quizzes.set(response.items);
        this.totalQuizzes.set(response.totalItems);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.loadError.set(true); },
    });
  }
}
