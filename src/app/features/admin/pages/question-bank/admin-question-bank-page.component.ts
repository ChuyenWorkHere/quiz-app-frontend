import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideAlertTriangle, LucideArrowDownUp, LucideCheckCircle2, LucideChevronLeft, LucideChevronRight, LucideEye, LucideFolderOpen, LucidePencil, LucidePlus, LucideRefreshCw, LucideSearch, LucideTrash2, LucideX } from '@lucide/angular';
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-admin-question-bank-page',
  imports: [FormsModule, RouterLink, LucideAlertTriangle, LucideArrowDownUp, LucideCheckCircle2, LucideChevronLeft, LucideChevronRight, LucideEye, LucideFolderOpen, LucidePencil, LucidePlus, LucideRefreshCw, LucideSearch, LucideTrash2, LucideX],
  templateUrl: './admin-question-bank-page.component.html',
  styleUrl: './admin-question-bank-page.component.css'
})
export class AdminQuestionBankPageComponent implements OnInit {
  private readonly questionService = inject(QuestionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  protected readonly search = signal('');
  protected readonly type = signal('all');
  protected readonly assignmentStatus = signal('all');
  protected readonly selected = signal<Set<number>>(new Set());
  protected readonly questions = signal<Question[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(0);
  protected readonly totalItems = signal(0);
  protected readonly deleteTarget = signal<Question | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');

  protected readonly filtered = computed(() => this.questions());
  protected readonly allSelected = computed(() =>
    this.filtered().length > 0 && this.filtered().every(question => this.selected().has(question.id)));

  ngOnInit(): void {
    this.searchChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadQuestions(1));
    this.loadQuestions();
  }

  protected loadQuestions(page = this.page()): void {
    this.page.set(page);
    this.loading.set(true);
    this.loadError.set(false);
    this.questionService.getAllQuestions(page, this.pageSize(), {
      search: this.search(),
      questionType: this.type() === 'all' ? undefined : Number(this.type()),
      assignmentStatus: this.assignmentStatus() === 'all' ? undefined : Number(this.assignmentStatus()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.questions.set(response.items);
          this.page.set(response.page);
          this.totalPages.set(response.totalPages);
          this.totalItems.set(response.totalItems);
          this.selected.set(new Set());
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.loadError.set(true); },
      });
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.loading()) return;
    this.loadQuestions(page);
  }
  protected toggle(id: number): void { const next = new Set(this.selected()); next.has(id) ? next.delete(id) : next.add(id); this.selected.set(next); }
  protected toggleAll(): void { const next = new Set(this.selected()); this.allSelected() ? this.filtered().forEach(q => next.delete(q.id)) : this.filtered().forEach(q => next.add(q.id)); this.selected.set(next); }
  protected changeSearch(value: string): void { this.search.set(value); this.searchChanges.next(value.trim()); }
  protected clearSearch(): void { this.changeSearch(''); }
  protected changeType(value: string): void { this.type.set(value); this.loadQuestions(1); }
  protected changeAssignmentStatus(value: string): void { this.assignmentStatus.set(value); this.loadQuestions(1); }
  protected questionTypeLabel(type: number): string { return ['Single Choice', 'Multiple Select', 'True / False'][type] ?? 'Unknown'; }
  protected levelLabel(level: number): string { return ['Hard', 'Medium', 'Easy'][level] ?? 'Unknown'; }
  protected correctAnswer(question: Question): string { return question.answers.filter(answer => answer.isCorrect).map(answer => answer.text).join(', ') || 'Not configured'; }

  protected openDelete(question: Question): void {
    this.deleteError.set('');
    this.deleteTarget.set(question);
  }

  protected closeDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
    this.deleteError.set('');
  }

  protected confirmDelete(): void {
    const question = this.deleteTarget();
    if (!question || this.deleting()) return;

    this.deleting.set(true);
    this.deleteError.set('');
    this.questionService.deleteQuestion(question.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const nextPage = this.page() > 1 && this.questions().length === 1
            ? this.page() - 1
            : this.page();
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.loadQuestions(nextPage);
        },
        error: (error: HttpErrorResponse) => {
          this.deleting.set(false);
          this.deleteError.set(
            error.error?.detail ?? error.error?.title ?? 'Unable to delete the question.',
          );
        },
      });
  }
}
