import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideBookOpenCheck, LucideChevronRight, LucideCircleAlert, LucideGraduationCap, LucideRefreshCw, LucideSearch, LucideShieldCheck, LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { QuizCardSkeletonComponent } from '../../../../shared/components/skeletons/quiz-card-skeleton/quiz-card-skeleton.component';
import { QuizCardComponent } from '../../../../shared/components/quiz-card/quiz-card.component';
import { Quiz } from '../../../home/models/quiz.model';
import { QuizService } from '../../../home/services/quiz.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

type CatalogState = 'catalog' | 'loading' | 'error';
type SortMode = 'popular' | 'duration' | 'recent' | 'rated';

@Component({
  selector: 'app-user-quizzes-page',
  imports: [FormsModule, QuizCardComponent, QuizCardSkeletonComponent, LucideBookOpenCheck, LucideChevronRight, LucideCircleAlert, LucideGraduationCap, LucideRefreshCw, LucideSearch, LucideShieldCheck, LucideSlidersHorizontal, LucideX],
  templateUrl: './user-quizzes-page.component.html',
  styleUrl: './user-quizzes-page.component.css'
})
export class UserQuizzesPageComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();
  protected readonly state = signal<CatalogState>('loading');
  protected readonly query = signal(''); 
  protected readonly sort = signal<SortMode>('popular'); 
  protected readonly quizzes = signal<Quiz[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = 6;
  protected readonly totalPages = signal(0);
  protected readonly totalItems = signal(0);
  protected readonly filteredQuizzes = computed(() => this.quizzes());

  ngOnInit(): void {
    this.searchChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadQuizzes(1));
    this.loadQuizzes();
  }

  protected loadQuizzes(page = this.page()): void {
    this.page.set(page);
    this.state.set('loading');
    this.quizService.getActiveQuizzes(page, this.pageSize, {
      search: this.query(),
      sortBy: this.sort(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.quizzes.set(response.items);
          this.page.set(response.page);
          this.totalPages.set(response.totalPages);
          this.totalItems.set(response.totalItems);
          this.state.set('catalog');
        },
        error: () => this.state.set('error'),
      });
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) return;
    this.loadQuizzes(page);
  }

  protected changeSearch(value: string): void { this.query.set(value); this.searchChanges.next(value.trim()); }
  protected clearSearch(): void { this.query.set(''); this.searchChanges.next(''); }
  protected changeSort(value: SortMode): void { this.sort.set(value); this.loadQuizzes(1); }
  protected resetFilters(): void { this.query.set(''); this.sort.set('popular'); this.loadQuizzes(1); }
  protected retry(): void { this.loadQuizzes(); }
}
