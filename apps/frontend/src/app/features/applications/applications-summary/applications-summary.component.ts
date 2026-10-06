import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-applications-summary',
  templateUrl: './applications-summary.component.html',
  styleUrl: './applications-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsSummaryComponent {
  readonly totalCount = input.required<number>();
  readonly pendingCount = input.required<number>();
  readonly acceptedCount = input.required<number>();
}
