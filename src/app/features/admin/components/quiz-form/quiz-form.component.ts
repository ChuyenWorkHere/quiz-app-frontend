import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { LucideArrowLeft, LucideBold, LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideCloudCheck, LucideCode2, LucideGripVertical, LucideImage, LucideInfo, LucideItalic, LucideList, LucidePackageOpen, LucidePlus, LucideRefreshCw, LucideRocket, LucideSave, LucideSearch, LucideShieldCheck, LucideShuffle, LucideTimer, LucideTrash2, LucideTriangleAlert, LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { QuizRequest, QuizService } from '../../../home/services/quiz.service';

interface QuizQuestion { id: number; code: string; type: string; text: string; topics: string; points: number; difficulty: string; quizId?: number | null; answers?: string[]; correctAnswers?: number[]; quizOnly?: boolean; }

@Component({
  selector: 'app-admin-quiz-form',
  imports: [FormsModule, RouterLink, DecimalPipe, LucideArrowLeft, LucideBold, LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideCloudCheck, LucideCode2, LucideGripVertical, LucideImage, LucideInfo, LucideItalic, LucideList, LucidePackageOpen, LucidePlus, LucideRefreshCw, LucideRocket, LucideSave, LucideSearch, LucideShieldCheck, LucideShuffle, LucideTimer, LucideTrash2, LucideTriangleAlert, LucideSlidersHorizontal, LucideX],
  templateUrl: './quiz-form.component.html',
  styleUrl: './quiz-form.component.css'
})
export class QuizFormComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly questionService = inject(QuestionService);
  private readonly router = inject(Router);
  readonly mode = input<'create' | 'edit'>('create');
  readonly quizId = input<string | null>(null);
  protected readonly isEditMode = computed(() => this.mode() === 'edit');
  protected readonly pageHeading = computed(() => this.isEditMode() ? 'Edit Quiz' : 'Create Quiz');
  protected readonly primaryActionLabel = computed(() => this.isEditMode() ? 'Save Changes' : 'Publish Quiz');
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly duration = signal(30);
  protected readonly threshold = signal(50);
  protected readonly image = signal('');
  protected readonly releaseStatus = signal('draft');
  protected readonly activeStep = signal(1);
  protected readonly simulateErrors = signal(false);
  protected readonly publishing = signal(false);
  protected readonly published = signal(false);
  protected readonly saved = signal(false);
  protected readonly questionSearch = signal('');
  protected readonly typeFilter = signal('All Formats');
  protected readonly questions = signal<QuizQuestion[]>([]);
  protected readonly assigned = signal<QuizQuestion[]>([]);
  protected readonly apiError = signal('');

  constructor() {
    effect(() => {
      const id = Number(this.quizId());
      if (this.isEditMode() && id > 0) this.loadQuiz(id);
    });
  }

  ngOnInit(): void {
    const currentQuizId = Number(this.quizId());
    forkJoin({
      unassigned: this.questionService.getUnassignedQuestions(1, 1000),
      assigned: this.isEditMode() && currentQuizId > 0
        ? this.questionService.getQuestionsByQuizId(currentQuizId, 1, 1000)
        : of({ items: [], page: 1, pageSize: 1000, totalPages: 0, totalItems: 0 }),
    }).subscribe({
      next: response => {
        const unassigned = response.unassigned.items.map(question => this.mapQuestion(question));
        const assigned = response.assigned.items.map(question => this.mapQuestion(question));
        const repository = [...assigned, ...unassigned]
          .filter((question, index, items) => items.findIndex(item => item.id === question.id) === index);
        this.questions.set(repository);
        this.assigned.set(assigned);
      },
      error: () => this.apiError.set('Unable to load questions from the question bank.'),
    });
  }

  protected readonly filteredQuestions = computed(() => {
    const query = this.questionSearch().trim().toLowerCase();
    return this.questions().filter(question =>
      (this.typeFilter() === 'All Formats' || question.type === this.typeFilter()) &&
      (!query || `${question.text} ${question.topics}`.toLowerCase().includes(query))
    );
  });
  protected readonly totalPoints = computed(() => this.assigned().reduce((total, item) => total + item.points, 0));
  protected readonly isValid = computed(() => !this.simulateErrors() && this.title().trim().length > 0 && this.duration() > 0 && this.assigned().length > 0);

  protected goToStep(step: number): void {
    this.activeStep.set(step);
    document.getElementById(`create-step-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected isAssigned(id: number): boolean { 
    return this.assigned().some(item => item.id === id); 
  }
  
  protected addQuestion(question: QuizQuestion): void {
    if (!this.isAssigned(question.id))
      this.assigned.update(items => [...items, question]);
  }

  protected removeQuestion(id: number): void {
    this.assigned.update(items => items.filter(item => item.id !== id));
  }
  protected clearQuestions(): void {
    this.assigned.set([]);
  }

  protected resetFilters(): void {
    this.questionSearch.set('');
    this.typeFilter.set('All Formats');
  }

  protected toggleValidation(): void {
    this.simulateErrors.update(value => !value);
    if (this.simulateErrors()) {
      this.title.set(''); this.duration.set(0);
    } else {
      this.title.set('Advanced Distributed Systems & Consensus Algorithms');
      this.duration.set(45);
    }
  }
  protected saveDraft(): void { this.persist(false); }
  protected publish(): void { this.persist(true); }

  private persist(isActive: boolean): void {
    if (!this.title().trim() || this.duration() <= 0 || (isActive && !this.assigned().length) || this.publishing()) return;
    this.publishing.set(true);
    this.apiError.set('');
    const request: QuizRequest = {
      title: this.title().trim(), description: this.description().trim(), duration: this.duration(),
      image: this.image().trim(), passedScore: this.threshold(), isActive,
      questionIds: this.assigned().map(question => question.id),
    };
    const id = Number(this.quizId());
    const operation = this.isEditMode() && id > 0
      ? this.quizService.updateQuiz(id, request)
      : this.quizService.createQuiz(request);
    operation.subscribe({
      next: () => {
        this.publishing.set(false); this.published.set(isActive); this.saved.set(!isActive);
        void this.router.navigate(['/admin/quizzes']);
      },
      error: (error: HttpErrorResponse) => {
        this.publishing.set(false);
        this.apiError.set(error.error?.detail ?? error.error?.title ?? 'Unable to save the quiz.');
      },
    });
  }

  private loadQuiz(id: number): void {
    this.quizService.getQuizById(id).subscribe({
      next: quiz => { 
        this.title.set(quiz.title); 
        this.description.set(quiz.description); 
        this.duration.set(quiz.duration); 
        this.threshold.set(quiz.passedScore); 
        this.image.set(quiz.image ?? ''); 
        this.releaseStatus.set(quiz.isActive ? 'active' : 'draft'); 
      },
      error: () => this.apiError.set('Unable to load the quiz.'),
    });
  }

  private mapQuestion(question: Question): QuizQuestion {
    const types = ['Single Choice', 'Multiple Select', 'True / False'];
    const levels = ['Hard', 'Medium', 'Easy'];
    return {
      id: question.id, code: `Q-${question.id}`, type: types[question.questionType] ?? 'Unknown', text: question.content,
      topics: question.quizTitle || 'Question Bank', points: 1, difficulty: levels[question.level] ?? 'Unspecified', quizId: question.quizId
    };
  }
}
