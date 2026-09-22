import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAlertTriangle, LucideCheck, LucideChevronDown, LucideChevronLeft, LucideChevronRight, LucideDownload, LucideEye, LucideInfo, LucidePencil, LucidePlus, LucideRefreshCw, LucideSearch, LucideSlidersHorizontal, LucideTimer, LucideTrash2, LucideX } from '@lucide/angular';
import { Quiz } from '../../../home/models/quiz.model';
import { QuizService } from '../../../home/services/quiz.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-admin-quiz-management-page',
  imports: [DatePipe, FormsModule, RouterLink, LucideAlertTriangle, LucideCheck, LucideChevronDown, LucideChevronLeft, LucideChevronRight, LucideDownload, LucideEye, LucideInfo, LucidePencil, LucidePlus, LucideRefreshCw, LucideSearch, LucideSlidersHorizontal, LucideTimer, LucideTrash2, LucideX],
  templateUrl: './admin-quiz-management-page.component.html',
  styleUrl: './admin-quiz-management-page.component.css'
})
export class AdminQuizManagementPageComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('all');
  protected readonly sortBy = signal('recent');
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly toastVisible = signal(false);
  protected readonly toastMessage = signal('Quiz deleted successfully.');
  protected readonly deleteTarget = signal<Quiz | 'selected' | null>(null);
  protected readonly deleteError = signal('');
  protected readonly deleting = signal(false);
  protected readonly pageSize = signal(6);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly quizzes = signal<Quiz[]>([]);

  protected readonly visibleQuizzes = computed(() => this.quizzes());

  protected readonly allVisibleSelected = computed(() =>
    this.visibleQuizzes().length > 0 && this.visibleQuizzes().every(q => this.selectedIds().has(q.id)));

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
    this.loading.set(true);
    this.loadError.set(false);
    const status = this.statusFilter();
    this.quizService.getAllQuizzes(page, this.pageSize(), {
      search: this.searchTerm(),
      isActive: status === 'all' ? undefined : status === 'active',
      sortBy: this.sortBy() as 'recent' | 'title' | 'questions' | 'duration',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.quizzes.set(response.items);
        this.page.set(response.page);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.selectedIds.set(new Set());
        this.loading.set(false);
      },
      error: () => { 
        this.loading.set(false); 
        this.loadError.set(true); 
      },
    });
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.loading()) return;
    this.loadQuizzes(page);
  }

  protected changePageSize(value: number): void { 
    this.pageSize.set(value); 
    this.loadQuizzes(1); 
  }
  protected changeSearch(value: string): void {
    this.searchTerm.set(value);
    this.searchChanges.next(value.trim());
  }
  protected changeStatus(value: string): void {
    this.statusFilter.set(value);
    this.loadQuizzes(1);
  }
  protected changeSort(value: string): void {
    this.sortBy.set(value);
    this.loadQuizzes(1);
  }
  protected toggleQuiz(id: number): void { 
    const next = new Set(this.selectedIds()); 
    next.has(id) ? next.delete(id) : next.add(id); 
    this.selectedIds.set(next); 
  }
  protected toggleAll(): void { 
    const next = new Set(this.selectedIds()); 
    this.allVisibleSelected() ? this.visibleQuizzes().forEach(q => next.delete(q.id)) : this.visibleQuizzes().forEach(q => next.add(q.id)); this.selectedIds.set(next); }
  protected clearFilters(): void { 
    this.searchTerm.set(''); 
    this.statusFilter.set('all'); 
    this.sortBy.set('recent');
    this.loadQuizzes(1);
  }
  protected openDelete(target: Quiz | 'selected'): void {
    this.deleteError.set('');
    this.deleteTarget.set(target);
  }
  protected closeDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
    this.deleteError.set('');
  }
  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target || this.deleting()) return;
    const ids = target === 'selected' ? [...this.selectedIds()] : [target.id];
    if (!ids.length) return;

    this.deleting.set(true);
    this.deleteError.set('');
    const operation = target === 'selected'
      ? this.quizService.deleteQuizzes(ids)
      : this.quizService.deleteQuiz(ids[0]);
    operation.subscribe({
      next: () => {
        const nextPage = this.page() > 1 && this.quizzes().every(quiz => ids.includes(quiz.id))
          ? this.page() - 1
          : this.page();
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.selectedIds.set(new Set());
        this.toastMessage.set(ids.length === 1 ? 'Quiz deleted successfully.' : `${ids.length} quizzes deleted successfully.`);
        this.toastVisible.set(true);
        this.loadQuizzes(nextPage);
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        this.deleteError.set(error.error?.detail ?? error.error?.title ?? 'Unable to delete the quiz.');
      },
    });
  }
  protected deleteName(): string { 
    const target = this.deleteTarget(); 
    return target === 'selected' ? 'selected multiple quizzes' : target?.title ?? 'selected quiz'; 
  }
}
