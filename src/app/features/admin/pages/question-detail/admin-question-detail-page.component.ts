import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideCircleAlert, LucideEdit3, LucideExternalLink, LucideImage, LucideRefreshCw, LucideTrash2, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-admin-question-detail-page',
  imports: [RouterLink, LucideArrowLeft, LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideCircleAlert, LucideEdit3, LucideExternalLink, LucideImage, LucideRefreshCw, LucideTrash2, LucideTriangleAlert, LucideX],
  templateUrl: './admin-question-detail-page.component.html',
  styleUrl: './admin-question-detail-page.component.css',
})
export class AdminQuestionDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly questionService = inject(QuestionService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly question = signal<Question | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly deleteOpen = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');

  ngOnInit(): void { this.loadQuestion(); }

  protected loadQuestion(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid question identifier.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.questionService.getQuestionById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: question => { this.question.set(question); this.loading.set(false); },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(error.status === 404 ? 'Question not found.' : 'Unable to load question details. Please try again.');
      },
    });
  }

  protected questionType(type: number): string { return ['Single Choice', 'Multiple Select', 'True / False'][type] ?? 'Unknown'; }
  protected difficulty(level: number): string { return ['Hard', 'Medium', 'Easy'][level] ?? 'Unknown'; }
  protected optionLabel(index: number): string { return String.fromCharCode(65 + index); }
  protected openDelete(): void { this.deleteError.set(''); this.deleteOpen.set(true); }
  protected closeDelete(): void { if (!this.deleting()) { this.deleteOpen.set(false); this.deleteError.set(''); } }

  protected confirmDelete(): void {
    const question = this.question();
    if (!question || this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set('');
    this.questionService.deleteQuestion(question.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigate(['/admin/questions']),
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        this.deleteError.set(error.error?.detail ?? error.error?.title ?? 'Unable to delete the question.');
      },
    });
  }
}
