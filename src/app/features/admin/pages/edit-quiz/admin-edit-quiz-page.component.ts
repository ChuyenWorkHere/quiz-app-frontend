import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizFormComponent } from '../../components/quiz-form/quiz-form.component';

@Component({
  selector: 'app-admin-edit-quiz-page',
  imports: [QuizFormComponent],
  templateUrl: './admin-edit-quiz-page.component.html',
  styleUrl: './admin-edit-quiz-page.component.css'
})
export class AdminEditQuizPageComponent {
  protected readonly quizId: string;

  constructor(route: ActivatedRoute) {
    this.quizId = route.snapshot.paramMap.get('id') ?? '';
  }
}
