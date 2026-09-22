import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideX, LucideArrowRight } from '@lucide/angular';
import { Quiz } from '../../models/quiz.model';
@Component({ 
  selector: 'app-quiz-detail', 
  imports: [RouterLink, LucideX, LucideArrowRight], 
  templateUrl: './quiz-detail.component.html', 
  styleUrl: './quiz-detail.component.css' })
export class QuizDetailComponent {
  protected readonly quiz = signal<Quiz | null>(null);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  open(quiz: Quiz): void { this.quiz.set(quiz); this.dialog().nativeElement.showModal(); }
}
