import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideArrowLeft, LucideCheckCircle2, LucideChevronRight, LucideCircleAlert, LucideClock3, LucideEye, LucideFileText, LucideImage, LucideListChecks, LucidePencil, LucideRefreshCw, LucideSearch } from '@lucide/angular';
import { Quiz } from '../../../home/models/quiz.model';
import { QuizService } from '../../../home/services/quiz.service';
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-admin-quiz-detail-page',
  imports: [FormsModule, RouterLink, LucideArrowLeft, LucideCheckCircle2, LucideChevronRight, LucideCircleAlert, LucideClock3, LucideEye, LucideFileText, LucideImage, LucideListChecks, LucidePencil, LucideRefreshCw, LucideSearch],
  templateUrl: './admin-quiz-detail-page.component.html',
  styleUrl: './admin-quiz-detail-page.component.css'
})
export class AdminQuizDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);
  private readonly questionService = inject(QuestionService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly quiz = signal<Quiz | null>(null);
  protected readonly questions = signal<Question[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal('all');
  protected readonly difficultyFilter = signal('all');
  protected readonly expanded = signal<Set<number>>(new Set());
  protected readonly filteredQuestions = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    return this.questions().filter(question =>
      (!search || question.content.toLowerCase().includes(search)) &&
      (this.typeFilter() === 'all' || String(question.questionType) === this.typeFilter()) &&
      (this.difficultyFilter() === 'all' || String(question.level) === this.difficultyFilter()));
  });

  ngOnInit(): void { this.loadQuizDetail(); }
  protected loadQuizDetail(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) { this.loading.set(false); this.errorMessage.set('Invalid quiz identifier.'); return; }
    this.loading.set(true); this.errorMessage.set('');
    forkJoin({ quiz: this.quizService.getQuizById(id), questions: this.questionService.getQuestionsByQuizId(id, 1, 1000) })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: response => { this.quiz.set(response.quiz); this.questions.set(response.questions.items); this.loading.set(false); },
        error: error => { this.loading.set(false); this.errorMessage.set(error.status === 404 ? 'Quiz not found.' : 'Unable to load quiz details. Please try again.'); },
      });
  }
  protected toggleAnswer(id: number): void { const next = new Set(this.expanded()); next.has(id) ? next.delete(id) : next.add(id); this.expanded.set(next); }
  protected resetFilters(): void { this.searchTerm.set(''); this.typeFilter.set('all'); this.difficultyFilter.set('all'); }
  protected questionType(value: number): string { return ['Single Choice', 'Multiple Select', 'True / False'][value] ?? 'Unknown'; }
  protected difficulty(value: number): string { return ['Hard', 'Medium', 'Easy'][value] ?? 'Unknown'; }
  protected correctAnswer(question: Question): string { return question.answers.filter(answer => answer.isCorrect).map(answer => answer.text).join(', ') || 'No correct answer configured'; }
}
