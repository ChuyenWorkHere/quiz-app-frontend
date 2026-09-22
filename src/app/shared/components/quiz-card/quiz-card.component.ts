import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideClock3, LucideListChecks } from '@lucide/angular';

export interface QuizCardData {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: number;
  questions?: number;
  numberOfQuestions?: number;
  attempts?: string | number;
  passRate?: number;
  passedPercentage?: number;
}

@Component({
  selector: 'app-quiz-card',
  imports: [RouterLink, LucideArrowRight, LucideClock3, LucideListChecks],
  templateUrl: './quiz-card.component.html',
  styleUrl: './quiz-card.component.css'
})
export class QuizCardComponent {
  readonly quiz = input.required<QuizCardData>();
  readonly mode = input<'preview' | 'portal'>('portal');
  readonly viewQuiz = output<QuizCardData>();
  protected readonly questionCount = computed(() => this.quiz().questions ?? this.quiz().numberOfQuestions ?? 0);
  protected readonly passRate = computed(() => this.quiz().passRate ?? this.quiz().passedPercentage);
}
