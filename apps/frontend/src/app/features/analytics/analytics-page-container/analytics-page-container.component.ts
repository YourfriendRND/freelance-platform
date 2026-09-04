import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-analytics-page-container',
  templateUrl: './analytics-page-container.component.html',
  styleUrl: './analytics-page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageContainerComponent {}
