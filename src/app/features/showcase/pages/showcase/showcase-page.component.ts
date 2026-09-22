import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideBookOpen, LucideCheckCircle, LucideClock3, LucideCloudOff, LucideInfo, LucideLockKeyhole, LucideSearch, LucideSearchX, LucideUserPlus, LucideX } from '@lucide/angular';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { Quiz } from '../../../home/models/quiz.model';

import { QuizService } from '../../../home/services/quiz.service';

@Component({
  selector: 'app-showcase-page',
  imports: [
    RouterLink, 
    HeaderComponent, 
    FooterComponent, 
    LucideBookOpen, 
    LucideSearch, 
    LucideX, 
    LucideLockKeyhole, 
    LucideClock3, 
    LucideArrowRight, 
    LucideCheckCircle, 
    LucideSearchX, 
    LucideCloudOff, 
    LucideInfo, 
    LucideUserPlus
  ],
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.css'
})
export class ShowcasePageComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly items = signal<Quiz[]>([]);
  protected readonly pageSize = 6;
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(false);
  protected readonly query = signal('');
  protected readonly selected = signal<Quiz | null>(null);
  protected readonly error = signal(false);
  protected readonly questionsOnPage = computed(() => this.items().reduce((sum, quiz) => sum + quiz.numberOfQuestions, 0));
  protected readonly quizzes = computed(() => {
    const query = this.query().toLowerCase().trim();
    return this.items().filter(quiz => (quiz.title + ' ' + quiz.description).toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.loadQuizzes();
  }

  protected loadQuizzes(page = this.page()): void {
    if (this.loading()) return;
    this.page.set(page);
    this.loading.set(true);
    this.error.set(false);
    this.selected.set(null);
    this.quizService.getActiveQuizzes(page, this.pageSize).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.items.set(response.items);
        this.page.set(response.page);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.loading()) return;
    this.clear();
    this.loadQuizzes(page);
  }

  protected clear(): void { this.query.set(''); }
}
