import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  AnalyticsSummaryCard,
  AnalyticsSummaryIcon,
} from '../analytics-freelancer.model';

@Component({
  selector: 'app-analytics-summary',
  templateUrl: './analytics-summary.component.html',
  styleUrl: './analytics-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsSummaryComponent {
  readonly cards = input.required<readonly AnalyticsSummaryCard[]>();

  protected readonly summaryIcon = AnalyticsSummaryIcon;
}
