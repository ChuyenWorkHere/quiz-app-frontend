import { Component, signal } from '@angular/core';
import { LucideTimer, LucideCircleCheck, LucideBadgeCheck } from '@lucide/angular';

@Component({
  selector: 'app-assessment-preview',
  imports: [LucideTimer, LucideCircleCheck, LucideBadgeCheck],
  templateUrl: './assessment-preview.component.html',
  styleUrl: './assessment-preview.component.css',
})
export class AssessmentPreviewComponent {
  protected readonly selectedAnswer = signal('B');
  protected readonly answers = [{ key: 'A', value: 'O(1)' }, { key: 'B', value: 'O(log n)' }, { key: 'C', value: 'O(n)' }];
}
