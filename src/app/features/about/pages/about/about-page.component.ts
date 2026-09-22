import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHouse, LucideBookOpen, LucideBadgeCheck, LucideChartNoAxesCombined, LucideHistory, LucideFlag, LucideCompass, LucideUserPlus } from '@lucide/angular';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RecallPulseComponent } from '../../components/recall-pulse/recall-pulse.component';
import { LearningStepsComponent } from '../../components/learning-steps/learning-steps.component';
import { MissionSectionComponent } from '../../components/mission-section/mission-section.component';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, HeaderComponent, FooterComponent, RecallPulseComponent, LearningStepsComponent, MissionSectionComponent, LucideHouse, LucideBookOpen, LucideBadgeCheck, LucideChartNoAxesCombined, LucideHistory, LucideFlag, LucideCompass, LucideUserPlus],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css',
})
export class AboutPageComponent { }
