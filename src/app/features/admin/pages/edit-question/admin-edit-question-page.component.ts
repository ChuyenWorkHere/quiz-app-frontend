import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionFormComponent, QuestionFormValue, QuestionType } from '../../components/question-form/question-form.component';
import { Question } from '../../models/question.model';
import { CreateQuestionRequest, QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-admin-edit-question-page',
  imports: [QuestionFormComponent],
  templateUrl: './admin-edit-question-page.component.html',
  styles: [`.state{margin:24px 28px;padding:18px;border-radius:12px;background:#fff;color:#334155;font-weight:700}.state.error{background:#fee2e2;color:#b91c1c}`],
})
export class AdminEditQuestionPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly questionService = inject(QuestionService);

  protected readonly questionId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly question = signal<QuestionFormValue | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  private submitting = false;

  ngOnInit(): void {
    if (!Number.isInteger(this.questionId) || this.questionId <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid question ID.');
      return;
    }

    this.questionService.getQuestionById(this.questionId).subscribe({
      next: question => {
        this.question.set(this.toFormValue(question));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.detail ?? error.error?.title ?? 'Unable to load the question.');
      },
    });
  }

  protected goBack(): void { void this.router.navigate(['/admin/questions']); }

  protected handleSubmit(event: { mode: 'draft' | 'finish' | 'another'; value: QuestionFormValue }): void {
    if (this.submitting) return;
    this.submitting = true;
    this.errorMessage.set('');
    this.questionService.updateQuestion(this.questionId, this.toRequest(event.value)).subscribe({
      next: () => { this.submitting = false; this.goBack(); },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage.set(error.error?.detail ?? error.error?.title ?? 'Unable to update the question. Please try again.');
      },
    });
  }

  private toFormValue(question: Question): QuestionFormValue {
    const type: QuestionType = question.questionType === 0 ? 'single' : question.questionType === 1 ? 'multiple' : 'boolean';
    const trueAnswer = question.answers.find(answer => answer.text.trim().toLowerCase() === 'true');
    return {
      type,
      prompt: question.content,
      rationale: '',
      hint: '',
      shuffle: true,
      booleanAnswer: trueAnswer?.isCorrect ?? true,
      options: question.answers.map(answer => ({ id: answer.id, text: answer.text, feedback: '', correct: answer.isCorrect })),
      quizId: question.quizId,
      level: question.level,
      image: question.image,
    };
  }

  private toRequest(value: QuestionFormValue): CreateQuestionRequest {
    return {
      content: value.prompt.trim(),
      image: value.image?.trim() ?? '',
      level: value.level ?? 1,
      questionType: value.type === 'single' ? 0 : value.type === 'multiple' ? 1 : 2,
      quizId: value.quizId ?? null,
      answers: value.type === 'boolean'
        ? [{ text: 'True', isCorrect: value.booleanAnswer }, { text: 'False', isCorrect: !value.booleanAnswer }]
        : value.options.map(option => ({ text: option.text.trim(), isCorrect: option.correct })),
    };
  }
}
