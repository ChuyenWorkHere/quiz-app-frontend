import { Component } from '@angular/core';
import { QuizFormComponent } from '../../components/quiz-form/quiz-form.component';

@Component({
  selector: 'app-admin-create-quiz-page',
  imports: [QuizFormComponent],
  templateUrl: './admin-create-quiz-page.component.html',
  styleUrl: './admin-create-quiz-page.component.css'
})
export class AdminCreateQuizPageComponent {}
