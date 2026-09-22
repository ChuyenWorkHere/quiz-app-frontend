import { HowItWorksComponent } from '../../components/how-it-works/how-it-works.component';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuizDetailComponent } from '../../components/quiz-detail/quiz-detail.component';
import { LucideZap, LucideSearch, LucideArrowRight, LucideStar, LucideGraduationCap, LucideSearchX, LucideRotateCcw } from '@lucide/angular';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { QuizCardComponent } from '../../../../shared/components/quiz-card/quiz-card.component';
import { AssessmentPreviewComponent } from '../../components/assessment-preview/assessment-preview.component';
import { Quiz } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-home-page',
  imports: [HowItWorksComponent, QuizDetailComponent, HeaderComponent, FooterComponent, QuizCardComponent, AssessmentPreviewComponent, LucideZap, LucideSearch, LucideArrowRight, LucideStar, LucideGraduationCap, LucideSearchX, LucideRotateCcw],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly quizzes = signal<Quiz[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly search = signal('');
  protected readonly filteredQuizzes = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.quizzes().filter(quiz => (quiz.title + ' ' + quiz.description).toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.loadQuizzes();
  }

  protected loadQuizzes(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.quizService.getActiveQuizzes(1, 6).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.quizzes.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  protected resetFilters(): void { this.search.set(''); }
}

